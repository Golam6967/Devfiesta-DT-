const { pool } = require("../config/database");
const User = require("../models/user");

class hackathon {
  static async host_hackathon(hackathon_data, username) {
    const {
      hackathon_name,
      duration,
      genre,
      rule_book,
      hackathon_image,
      starting_date,
      ending_date,
      judge_username = [],
      judging_criteria = [],
    } = hackathon_data;
    const [hackathon_result] = await pool.execute(
      `insert into hackathon(hackathon_name,host_username,duration,genre,rule_book,hackathon_image,starting_date,ending_date,added_date) values(?,?,?,?,?,?,?,?,NOW())`,
      [
        hackathon_name,
        username,
        duration,
        genre,
        rule_book,
        hackathon_image,
        starting_date,
        ending_date,
      ]
    );

    const hackathon_id = hackathon_result.insertId;

    const judgeUsernames = judge_username.split(",").map((j) => j.trim());
    console.log(judgeUsernames);

    for (const judge of judgeUsernames) {
      const judge_username = (judge || "").trim();
      console.log("this is the user ", judge_username);
      if (!judge_username) continue;

      const user = await User.findByUsername(judge_username);

      if (user) {
        await pool.execute(
          `INSERT INTO judges (judge_username, hackathon_id) VALUES (?, ?)`,
          [judge_username, hackathon_id]
        );
      } else {
        console.warn(
          `User not found: ${judge_username} — skipping judge_entry`
        );
      }
    }
    const criteriaList = (judging_criteria || "").split("|").map((c) => c.trim());

    for (const criteriaInfo of criteriaList) {
      if (!criteriaInfo) continue;

      await pool.execute(
        `INSERT INTO criterias (hackathon_id, criteria_info) VALUES (?, ?)`,
        [hackathon_id, criteriaInfo]
      );
    }

    return hackathon_id;
  }

  static async get_hackathon_by_username(username) {
    const [hackathon] = await pool.execute(
      `select * from hackathon where host_username=?`,
      [username]
    );
    return hackathon;
  }
  static async get_hackathon_by_genre(genre) {
    const [hackathon] = await pool.execute(
      `select * from hackathon where genre=?`,
      [genre]
    );
    return hackathon;
  }
  static async get_all_hackathon() {
    const [hackathons] = await pool.execute(`
    SELECT 
      h.hackathon_id,
      h.hackathon_name,
      h.host_username,
      h.duration,
      h.genre,
      h.rule_book,
      h.hackathon_image,
      h.starting_date,
      h.ending_date,
      h.added_date,
      GROUP_CONCAT(DISTINCT CONCAT(c.criteria_id, ':', c.criteria_info)) AS criterias,
      GROUP_CONCAT(DISTINCT j.judge_username) AS judges
    FROM hackathon h
    LEFT JOIN criterias c ON h.hackathon_id = c.hackathon_id
    LEFT JOIN judges j ON h.hackathon_id = j.hackathon_id
    GROUP BY h.hackathon_id
    ORDER BY h.added_date DESC
  `);

    return hackathons.map((h) => ({
      ...h,
      judging_criteria: h.criterias
        ? h.criterias.split(",").map((c) => {
            const [id, info] = c.split(":");
            return { criteria_id: Number(id), criteriainfo: info };
          })
        : [],
      judges: h.judges ? h.judges.split(",") : [],
    }));
  }
  static async get_hackathon_by_id(hackathon_id) {
    const [hackathon] = await pool.execute(
      `select * from hackathon where hackathon_id=?`,
      [hackathon_id]
    );
    return hackathon;
  }

  static async get_judge_details(hackathon_id) {
    const [judge] = await pool.execute(
      `select * from users u join judges j on u.username=judge_username where j.hackathon_id=?`,
      [hackathon_id]
    );
    return judge;
  }

  static async get_hackathon_by_name(hackathon_name) {
    const [hackathon] = await pool.execute(
      `select * from hackathon where hackathon_name=?`,
      [hackathon_name]
    );
    return hackathon;
  }

  static async get_hackathon_by_duration(duration) {
    const [hackathon] = await pool.execute(
      `select * from hackathon where duration=?`,
      [duration]
    );
    return hackathon;
  }

  static async get_hackathons_by_judges(judge_username) {
    const [hackathon] = await pool.execute(
      `select * from hackathon h join judges j on h.hackathon_id=j.hackathon_id where j.judge_username=? and h.ending_date >= current_date`,
      [judge_username]
    );
    return hackathon;
  }

  static async get_all_hackathons_by_judges(judge_username) {
    const [hackathon] = await pool.execute(
      `select * from hackathon h join judges j on h.hackathon_id=j.hackathon_id where j.judge_username=?`,
      [judge_username]
    );
    return hackathon;
  }

  static async role_finding(username, hackathon_id) {
    const role = await pool.execute(
      `SELECT u.username, h.hackathon_id,
                                        CASE
                                            WHEN h.host_username = u.username THEN 'Host'
                                            WHEN j.judge_username = u.username THEN 'Judge'
                                            WHEN tp.username = u.username THEN 'Participant'
                                            ELSE 'No Role'
                                        END AS role
                                        FROM users u
                                            LEFT JOIN hackathon h ON h.hackathon_id = ?
                                            LEFT JOIN judges j ON j.hackathon_id = h.hackathon_id AND j.judge_username = u.username
                                            LEFT JOIN team_participants tp ON tp.hackathon_id = h.hackathon_id AND tp.username = u.username
                                            WHERE u.username = ?`,
      [hackathon_id, username]
    );
    return role;
  }

  static async get_user_role(req, res) {
    try {
      const { username } = req.user;
      const { hackathon_id } = req.params;

      const [role] = await Hackathon.role_finding(username, hackathon_id);

      if (!role || role.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No role found for ${username} in hackathon ${hackathon_id}`
        );
      }

      return ResponseHandler.success(
        res,
        { role },
        "Role retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving role:", error);
      ResponseHandler.error(res, "Failed retrieving role", 500, error.message);
    }
  }
}

module.exports = hackathon;
