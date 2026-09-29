const { pool } = require("../config/database");
const team = require("../models/participants");
const User = require("../models/user");
class Project {
  static async createProject(projectData, username) {
    const {
      project_name,
      git_repo = null,
      overview = null,
      motivation = null,
      features = null,
      project_genre,
      project_image = null,
    } = projectData;

    const [projectResult] = await pool.execute(
      `INSERT INTO projects (
        project_name, git_repo, overview, motivation, features, project_genre, project_image, creation_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [project_name, git_repo ?? null, overview ?? null, motivation ?? null, features ?? null, project_genre, project_image ?? null]
    );

    const project_id = projectResult.insertId;

    await pool.execute(
      `INSERT INTO p_u_junction (project_id, username) VALUES (?, ?)`,
      [project_id, username]
    );

    return { project_id };
  }
  static async createProject_for_team(projectData, team_id) {
    const {
      project_name,
      git_repo = null,
      overview = null,
      motivation = null,
      features = null,
      project_genre,
      project_image = null,
    } = projectData;

    const team_info = await team.team_members(team_id);
    if (!team_info.length) throw new Error("No team participants found");
    const hackathon_id = team_info[0].hackathon_id;

    const [existingSubmission] = await pool.execute(
      `select 1 from p_t_junction where team_id = ? limit 1`,
      [team_id]
    );
    if (existingSubmission.length > 0) {
      throw new Error("This team has already submitted a project for this hackathon");
    }

    const [projectResult] = await pool.execute(
      `INSERT INTO projects (
        project_name, git_repo, overview, motivation, features, project_genre, project_image, creation_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [project_name, git_repo ?? null, overview ?? null, motivation ?? null, features ?? null, project_genre, project_image ?? null]
    );

    const project_id = projectResult.insertId;

    await pool.execute(
      `insert into p_t_junction(team_id,project_id,hackathon_id) values(?,?,?)`,
      [team_id, project_id, hackathon_id]
    );
    for (const participant of team_info) {
      const participants_username = (participant.username || "").trim();
      if (!participants_username) continue;

      const user = await User.findByUsername(participants_username);
      console.log("this is the done", user);
      if (user) {
        await pool.execute(
          `INSERT INTO p_u_junction (project_id, username) VALUES (?, ?)`,
          [project_id, participants_username]
        );
      } else {
        console.warn(
          `User not found: ${participants_username} — skipping entry`
        );
      }
    }
    return { project_id };
  }

  static async getProjectById(project_id) {
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_id = ?`,
      [project_id]
    );
    return projects[0] || null;
  }

  static async getAllProjects() {
    const [projects] = await pool.execute(`SELECT * FROM projects`);
    return projects;
  }

  static async getProjectsByUsername(username) {
    const [projects] = await pool.execute(
      `SELECT * FROM projects p
       JOIN p_u_junction pu ON p.project_id = pu.project_id
       WHERE pu.username = ?`,
      [username]
    );
    return projects;
  }

  static async updateProject(project_id, updateData) {
    const {
      project_name,
      git_repo,
      overview,
      motivation,
      features,
      project_genre,
    } = updateData;

    const [result] = await pool.execute(
      `UPDATE projects SET
        project_name = COALESCE(?, project_name),
        git_repo = COALESCE(?, git_repo),
        overview = COALESCE(?, overview),
        motivation = COALESCE(?, motivation),
        features = COALESCE(?, features),
        project_genre = COALESCE(?, project_genre)
       WHERE project_id = ?`,
      [
        project_name,
        git_repo,
        overview,
        motivation,
        features,
        project_genre,
        project_id,
      ]
    );

    return result;
  }

  static async deleteProject(project_id) {
    await pool.execute(`DELETE FROM p_u_junction WHERE project_id = ?`, [
      project_id,
    ]);

    const [result] = await pool.execute(
      `DELETE FROM projects WHERE project_id = ?`,
      [project_id]
    );

    return result;
  }

  static async getUsersByProject(project_id) {
    const [users] = await pool.execute(
      `SELECT u.username, u.full_name FROM users u
       JOIN p_u_junction pu ON u.username = pu.username
       WHERE pu.project_id = ?`,
      [project_id]
    );
    return users;
  }
  static async getProjectsByGenre(project_genre) {
    const [projects] = await pool.execute(
      `SELECT * FROM projects WHERE project_genre = ?`,
      [project_genre]
    );
    return projects;
  }

  static async getProjectbyDate() {
    const [projects] = await pool.execute(
      `select * from projects order by creation_date DESC;`
    );
    return projects;
  }

  static async teams_project(team_id) {
    const [project] = await pool.execute(
      `SELECT p.*
     FROM projects p
     JOIN p_t_junction ptj ON p.project_id = ptj.project_id
     WHERE ptj.team_id = ?`,
      [team_id]
    );
    return project;
  }
  static async getProjectsByHackathonAndUser(hackathonId, username) {
    try {
      const query = `
        SELECT DISTINCT 
          p.project_id,
          p.project_name,
          p.git_repo,
          p.demo_link,
          p.overview,
          p.motivation,
          p.features,
          p.project_genre,
          p.creation_date,
          t.team_id,
          t.team_name,
          h.hackathon_id,
          h.hackathon_name
        FROM projects p
        JOIN p_u_junction pu ON p.project_id = pu.project_id
        JOIN p_t_junction pt ON p.project_id = pt.project_id
        JOIN teams t ON pt.team_id = t.team_id
        JOIN hackathon h ON pt.hackathon_id = h.hackathon_id
        WHERE pu.username = ? AND pt.hackathon_id = ?;
      `;

      const [rows] = await pool.execute(query, [username, hackathonId]);
      return rows;
    } catch (error) {
      console.error("❌ DB Error in getProjectsByHackathonAndUser:", error);
      throw error;
    }
  }

  // ... your existing methods like createProject, getProjectById, etc.
}

module.exports = Project;
