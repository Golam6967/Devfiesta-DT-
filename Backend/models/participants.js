const { pool } = require("../config/database");
const User = require("../models/user");

class team{
    static async team_creation(team_name, team_info)
    {
        const[team_insertion]= await pool.execute(`insert into teams(team_name, team_info) values(?,?)`,[team_name,team_info]);
        const team_id= team_insertion.insertId; 
        return team_id;
    }

    static async team_participants(data)
    {
        const{
            hackathon_id,
            team_name,
            team_info,
            team_participants
        }= data;

        const participants_username = team_participants.map(p => p.trim()).filter(Boolean);
        if (participants_username.length === 0) {
            throw new Error("At least one team participant is required");
        }

        // Check every participant BEFORE creating anything, so a request that
        // includes someone already on a team this hackathon fails cleanly
        // instead of silently creating an empty orphan team.
        const alreadyRegistered = [];
        for (const username of participants_username) {
            const [exists] = await pool.execute(
                `select count(*) as count from team_participants where username= ? and hackathon_id= ?`,
                [username, hackathon_id]
            );
            if (exists[0].count > 0) alreadyRegistered.push(username);
        }
        if (alreadyRegistered.length > 0) {
            throw new Error(
                `Already registered for a team in this hackathon: ${alreadyRegistered.join(", ")}`
            );
        }

        const team_id= await this.team_creation(team_name,team_info);
        for(const users of participants_username)
        {
            await pool.execute(`insert into team_participants(team_id, hackathon_id, username) values(?,?,?)`,[team_id, hackathon_id, users]);
        }

        return team_id;
    }

    static async finding_team(hackathon_id)
    {
        const [team_list] = await pool.execute(`SELECT DISTINCT t.team_id, t.team_name, t.team_info
FROM teams t
JOIN team_participants tp ON t.team_id = tp.team_id
WHERE tp.hackathon_id=?`,[hackathon_id]);

        return team_list;
    }

    static async team_members(team_id)
    {
        const [team_members]= await pool.execute(`select * from team_participants where team_id= ?`,[team_id]);
        return team_members;
    }

    static async findByHackathonAndUser(hackathon_id, username) {
        console.log(hackathon_id,username)
    const [rows] = await pool.execute(
      `SELECT t.team_id, t.team_name, t.team_info
       FROM teams t
       JOIN team_participants tp ON t.team_id = tp.team_id
       WHERE tp.hackathon_id = ? AND tp.username = ?`,
      [hackathon_id, username]
    );
    console.log(rows)
    return rows;
  }

    static async team_marking(team_id, hackathon_id, judge_username, criteria_ids, marks, comments)
    {
        for (let i = 0; i < criteria_ids.length; i++) {
            const criteria_id = criteria_ids[i];
            const mark = marks[i];

            await pool.execute(`INSERT INTO marking(hackathon_id, judge_username, team_id, criteria_id, marks, comments) VALUES (?, ?, ?, ?, ?, ?)`,[hackathon_id, judge_username, team_id, criteria_id, mark, comments]);
  
        }
    }
    
    static async leader_board(hackathon_id)
    {
        const [leader_board]= await pool.execute(`SELECT t.team_id, t.team_name, SUM(m.marks) AS total_marks, RANK() OVER (ORDER BY SUM(m.marks) DESC) AS team_rank FROM teams t JOIN team_participants tp ON t.team_id = tp.team_id LEFT JOIN marking m ON t.team_id = m.team_id AND tp.hackathon_id = m.hackathon_id WHERE tp.hackathon_id = ? GROUP BY t.team_id, t.team_name ORDER BY total_marks DESC`,[hackathon_id]);
        return leader_board;
    }

    static async team_finding_by_username(username, hackathon_id)
    {
        const [team]= await pool.execute(`Select * from team t join team_participants tp on t.team_id= tp.team_id where tp.username= ? and tp.hackathon_id= ?`,[username,hackathon_id]);
        return team;
    }

    static async get_project_data_by_team_id(team_id)
    {
        const [ project ]= await pool.execute(`select * from projects p join p_t_junction on p.project_id= pt.project_id where pt.team_id=?`,[team_id]);
        return project;
    }

    static async get_Judges_marking_data(hackathon_id, team_id, judge_username)
    {
        const [marking_data]= await pool.execute(`select * from marking where hackathon_id= ? and team_id= ? and judge_username= ?`,[hackathon_id, team_id, judge_username]);
        return marking_data;
    }
    static async update_Judges_marking(hackathon_id, judge_username, team_id, criteria_ids, marks)
    {
        for (let i = 0; i < criteria_ids.length; i++) {
            const criteria_id = criteria_ids[i];
            const mark = marks[i];
            await pool.execute(`UPDATE marking SET marks= ? WHERE hackathon_id= ? AND judge_username= ? AND team_id= ? AND criteria_id= ?`,[mark, hackathon_id, judge_username, team_id, criteria_id]);
            return true;
        }
    }
}
module.exports = team;