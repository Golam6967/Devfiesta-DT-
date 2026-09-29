const { pool } = require("../config/database");
const User = require("../models/user");

class PBL {
    static async host_pbl(pbl_data, username) {
        const {
            pbl_name,
            pbl_rule_book,
            proposal_Date,
            progress_date,
            final_presentation,
            student_pass,
            judge_pass,
            supervisor_pass,
        } = pbl_data;

        const [pbl_result] = await pool.execute(
            `INSERT INTO pbl (
                pbl_name, host_username, pbl_rule_book, proposal_Date, progress_date, final_presentation,
                student_pass, judge_pass, supervisor_pass
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                pbl_name,
                username,
                pbl_rule_book,
                proposal_Date,
                progress_date,
                final_presentation,
                student_pass,
                judge_pass,
                supervisor_pass
            ]
        );

        const pbl_id = pbl_result.insertId;
        return pbl_id;
    }

    static async get_pbl_by_username(username) {
        const [pbl] = await pool.execute(`SELECT * FROM pbl WHERE host_username=?`, [username]);
        return pbl;
    }

    static async get_all_pbl() {
        const [pbls] = await pool.execute(`
            SELECT * from pbl`);

        return pbls;
    }

    static async get_pbl_by_id(pbl_id) {
        const [pbl] = await pool.execute(`SELECT * FROM pbl WHERE pbl_id=?`, [pbl_id]);
        return pbl;
    }


    static async get_pbl_by_name(pbl_name) {
        const [pbl] = await pool.execute(`SELECT * FROM pbl WHERE pbl_name=?`, [pbl_name]);
        return pbl;
    }

    static async get_pbls_by_judge(judge_username) {
        const [pbl] = await pool.execute(
            `SELECT * FROM pbl p 
             JOIN judgeXpbl j ON p.pbl_id=j.pbl_id 
             WHERE j.judge_username=?`,
            [judge_username]
        );
        return pbl;
    }

    static async get_pbls_by_student(student_username) {
        const [pbl] = await pool.execute(`select * from pbl p join studentsXpbl sp on p.pbl_id=sp.pbl_id where sp.student_username=?`, [student_username]);
        return pbl;
    }

    static async insert_student(pbl_id, student_username, student_id) {
        const student_id_count = await pool.execute(`select count(*) as count from studentsXpbl where student_id= ? and pbl_id= ?`, [student_id, pbl_id]);
        if (student_id_count[0][0].count > 0) {
            console.error(`Student ID already exists, Student ID: ${student_id}`);
            return null;
        }
        const student_username_count = await pool.execute(`select count(*) as count from studentsXpbl where student_username= ? and pbl_id= ?`, [student_username, pbl_id]);
        if (student_username_count[0][0].count > 0) {
            console.error(`Student username already exists, Username: ${student_username}`);
            return null;
        }
        const [inserted] = await pool.execute(`insert into studentsXpbl(pbl_id, student_id, student_username) values (?,?,?)`, [pbl_id, student_id, student_username]);
        return inserted;
    }

    static async insert_judge(pbl_id, judge_username) {
        const judge_username_count = await pool.execute(`select count(*) as count from judgeXpbl where judge_username= ? and pbl_id= ?`, [judge_username, pbl_id]);
        if (judge_username_count[0][0].count > 0) {
            console.error(`Judge username already exists, Username: ${judge_username}`);
            return null;
        }
        const [inserted] = await pool.execute(`insert into judgeXpbl(pbl_id, judge_username) values (?,?)`, [pbl_id, judge_username]);
        return inserted.insertId;
    }

    static async insert_supervisor(pbl_id, supervisor_username) {
        const supervisor_username_count = await pool.execute(`select count(*) as count from supervisor where username= ? and pbl_id= ?`, [supervisor_username, pbl_id]);
        if (supervisor_username_count[0][0].count > 0) {
            console.error(`Supervisor username already exists, Username: ${supervisor_username}`);
            return null;
        }
        const [supervisor] = await pool.execute(`insert into supervisor(pbl_id, username) values (?,?)`, [pbl_id, supervisor_username]);
        return supervisor.insertId;
    }

    static async team_creation(pbl_id, usernames, team_info, team_name, supervisor_username) {
        // create team
        const [team] = await pool.execute(
            `INSERT INTO teams(team_name, team_info) VALUES (?, ?)`,
            [team_name, team_info]
        );

        // get supervisor
        const [supervisorRows] = await pool.execute(
            `SELECT supervisor_id FROM supervisor WHERE username = ? AND pbl_id = ?`,
            [supervisor_username, pbl_id]
        );
        const supervisor_id = supervisorRows[0]?.supervisor_id;

        console.log("Received usernames:", usernames);

        for (const student of usernames) {
            // student is an object like { username: "Musabbereen" }
            const student_username = (student.username || "").trim();
            console.log("this is the user", student_username);

            if (!student_username) continue;

            const user = await User.findByUsername(student_username);

            if (user) {
                await pool.execute(
                    `INSERT INTO teamXpbl (team_id, pbl_id, username, supervisor_id) VALUES (?, ?, ?, ?)`,
                    [team.insertId, pbl_id, student_username, supervisor_id]
                );
            } else {
                console.warn(`User not found: ${student_username} — skipping student entry`);
            }
        }

        return team.insertId;
    }

    static async get_team_details(team_id, pbl_id) {
        try {
            const [teamRows] = await pool.execute(
                `SELECT team_name, team_info 
                 FROM teams 
                 WHERE team_id = ?`,
                [team_id]
            );

            if (teamRows.length === 0) {
                return { message: "Team not found" };
            }

            const teamName = teamRows[0].team_name;
            const teamInfo = teamRows[0].team_info;

            const [supervisorRows] = await pool.execute(
                `SELECT u.full_name AS supervisor_name 
                 FROM supervisor s 
                 JOIN users u ON s.username = u.username
                 WHERE s.supervisor_id = (
                    SELECT supervisor_id 
                    FROM teamXpbl 
                    WHERE team_id = ? AND pbl_id = ?
                 )`,
                [team_id, pbl_id]
            );

            const supervisorName = supervisorRows.length > 0 ? supervisorRows[0].supervisor_name : null;

            const [memberRows] = await pool.execute(
                `SELECT u.full_name, u.username, sp.student_id
                 FROM teamXpbl tx
                 JOIN users u ON tx.username = u.username
                 LEFT JOIN studentsXpbl sp ON sp.student_username = u.username AND sp.pbl_id = tx.pbl_id
                 WHERE tx.team_id = ? AND tx.pbl_id = ?`,
                [team_id, pbl_id]
            );

            return {
                team_name: teamName,
                team_info: teamInfo,
                supervisor_name: supervisorName,
                members: memberRows
            };
        } catch (error) {
            console.error("Error fetching PBL team details:", error);
            throw error;
        }
    }


    static async get_student_team_information(username, pbl_id) {
        const [team_information] = await pool.execute(`select * from teams t join teamXpbl tb on t.team_id= tb.team_id where tb.username=? and tb.pbl_id= ?`, [username, pbl_id]);
        return team_information;
    }
    static async get_supervisor_username_by_id(supervisor_id) {
        const [supervisor] = await pool.execute(
            `SELECT username FROM supervisor WHERE supervisor_id = ?`,
            [supervisor_id]
        );
        return supervisor; // returns an array; can return supervisor[0] in controller
    }


    static async judge_marking_in_pbl(judge_username, pbl_id, student_username, pbl_criteria_ids, presentation_type, marks, comments) {
        console.log(judge_username, pbl_id, student_username, pbl_criteria_ids, presentation_type, marks, comments)

        for (let i = 0; i < pbl_criteria_ids.length; i++) {
            const pbl_criteria_id = pbl_criteria_ids[i];
            const mark = marks[i];
            await pool.execute(`insert into pbl_markings(pbl_id, judge_username, student_username, pbl_criteria_id,presentation_type,marks, comments ) values(?,?,?,?,?,?,?)`, [pbl_id, judge_username, student_username, pbl_criteria_id, presentation_type, mark, comments]);
        }
        return true;
    }

    static async judge_mark_update_in_pbl(judge_username, pbl_id, student_username, pbl_criteria_ids, presentation_type, marks, comments) {
        for (let i = 0; i < pbl_criteria_ids.length; i++) {
            const pbl_criteria_id = pbl_criteria_ids[i];
            const mark = marks[i];
            await pool.execute(`update pbl_markings set marks= ?, comments= ? ,presentation_type= ? where pbl_id=? and judge_username=? and student_username= ? and pbl_criteria_id=? `, [mark, comments, presentation_type, pbl_id, judge_username, student_username, pbl_criteria_id,]);
        }
        return true;
    }

    static async update_pbl_dates(pbl_id, proposal_Date, progress_date, final_presentation) {
        await pool.execute(
            `UPDATE pbl SET proposal_Date=?, progress_date=?, final_presentation=? WHERE pbl_id=?`,
            [proposal_Date, progress_date, final_presentation, pbl_id]
        );
        return true;

    }

    static async get_judge_marks(judge_username, pbl_id, presentation_type) {
        const [marks] = await pool.execute(`select * from pbl_markings where judge_username= ? and pbl_id = ? and presentation_type=?`, [judge_username, pbl_id, presentation_type]);
        return marks;
    }

    static async getStudentMarkings(pbl_id, student_username) {
        try {
            const [markings] = await pool.execute(
                `SELECT 
                    pm.marks,
                    pm.comments,
                    pm.judge_username,
                    pm.presentation_type,
                    u.full_name AS judge_name,
                    pc.criteria_info
                 FROM pbl_markings pm
                 JOIN users u ON pm.judge_username = u.username
                 JOIN pbl_criteria pc ON pm.pbl_criteria_id = pc.pbl_criteria_id
                 WHERE pm.pbl_id = ? AND pm.student_username = ?`,
                [pbl_id, student_username]
            );

            return markings.map(m => ({
                presentation_type: m.presentation_type,
                judge_name: m.judge_name,
                judge_username: m.judge_username,
                criteria_info: m.criteria_info,
                marks: m.marks,
                comments: m.comments
            }));
        } catch (error) {
            console.error("Error in getStudentMarkings:", error);
            throw error;
        }
    }




    static async getTotalMarksForStudents(pbl_id) {
        try {
            const [results] = await pool.execute(
                `SELECT 
                    pm.student_username,
                    u.full_name,
                    SUM(pm.marks) AS total_marks,
                    AVG(pm.marks) AS average_marks
                 FROM pbl_markings pm
                 JOIN users u ON pm.student_username = u.username
                 WHERE pm.pbl_id = ?
                 GROUP BY pm.student_username, u.full_name
                 ORDER BY total_marks DESC`,
                [pbl_id]
            );
            console.log(results)

            return results.map(r => ({
                student_username: r.student_username,
                student_name: r.full_name,
                total_marks: r.total_marks,
                average_marks: r.average_marks
            }));
        } catch (error) {
            console.error("Error in getTotalMarksForStudents:", error);
            throw error;
        }
    }

    static async role_finding(username, pbl_id) {
        const [role] = await pool.execute(
            `SELECT u.username, p.pbl_id,
                CASE
                    WHEN p.host_username = u.username THEN 'Host'
                    WHEN j.judge_username = u.username THEN 'Judge'
                    WHEN sp.student_username = u.username THEN 'Student'
                    when super.username= u.username THEN 'Supervisor'
                    ELSE 'No Role'
                END AS role
            FROM users u
                LEFT JOIN pbl p ON p.pbl_id = ?
                LEFT JOIN judgeXpbl j ON j.pbl_id = p.pbl_id AND j.judge_username = u.username
                LEFT JOIN studentsXpbl sp ON sp.pbl_id = p.pbl_id AND sp.student_username = u.username
                LEFT JOIN supervisor super ON super.pbl_id = p.pbl_id AND super.username = u.username
            WHERE u.username = ?`,
            [pbl_id, username]
        );
        console.log(role)
        return role;
    }

    static async getStudentsInPBL(pbl_id) {
        const [users] = await pool.execute(
            `SELECT * from studentsXpbl WHERE pbl_id = ?`, [pbl_id]);
        return users;
    }

    static async getJudgesInPBL(pbl_id) {
        const [users] = await pool.execute(
            `SELECT * from judgeXpbl WHERE pbl_id = ?`, [pbl_id]);
        return users;
    }
    static async getSupervisorsInPBL(pbl_id) {
        const [users] = await pool.execute(
            `SELECT * from supervisor WHERE pbl_id = ?`, [pbl_id]);
        return users;
    }

    static async get_student_pass(pbl_id) {
        const [pass] = await pool.execute(`select student_pass from pbl where pbl_id=?`, [pbl_id]);
        return pass;
    }
    static async get_judge_pass(pbl_id) {
        const [pass] = await pool.execute(`select judge_pass from pbl where pbl_id=?`, [pbl_id]);
        return pass;
    }
    static async get_supervisor_pass(pbl_id) {
        const [pass] = await pool.execute(`select supervisor_pass from pbl where pbl_id=?`, [pbl_id]);
        return pass;
    }

    static async pbl_file_sub(pbl_id, team_id, file_link, presentation_type) {
        const [submission] = await pool.execute(`insert into pbl_team_files(pbl_id, team_id, presentation_file, presentation_type) values(?,?,?,?)`, [pbl_id, team_id, file_link, presentation_type]);
        return submission;
    }

    static async get_pbl_file_sub(pbl_id, team_id) {
        const [files] = await pool.execute(`select * from pbl_team_files where pbl_id= ? and team_id= ?`, [pbl_id, team_id]);
        return files;
    }

    static async update_pbl_file_sub(pbl_id, team_id, file_link, presentation_type) {
        const [update] = await pool.execute(`update pbl_team_files set presentation_file= ? where pbl_id= ? and team_id= ? and presentation_type= ?`, [file_link, pbl_id, team_id, presentation_type]);
        return update;
    }
    static async getTeamsByPblId(pbl_id) {
        try {
            const [teams] = await pool.execute(`
            SELECT DISTINCT 
                t.team_id, 
                t.team_name, 
                t.team_info,
                s.supervisor_id,
                u.full_name AS supervisor_name
            FROM teams t
            INNER JOIN teamXpbl tx ON t.team_id = tx.team_id
            INNER JOIN supervisor s ON tx.supervisor_id = s.supervisor_id
            INNER JOIN users u ON s.username = u.username
            WHERE tx.pbl_id = ?`,
                [pbl_id]
            );
            const [members] = await pool.execute(`
            SELECT 
                tx.team_id,
                u.username,
                u.full_name,
                sp.student_id
            FROM teamXpbl tx
            INNER JOIN users u ON tx.username = u.username
            LEFT JOIN studentsXpbl sp ON (sp.pbl_id = tx.pbl_id AND sp.student_username = tx.username)
            WHERE tx.pbl_id = ?`,
                [pbl_id]
            );

            const teamsWithMembers = teams.map(team => {
                const teamMembers = members.filter(member => member.team_id === team.team_id);
                return {
                    ...team,
                    members: teamMembers.map(m => ({
                        username: m.username,
                        full_name: m.full_name,
                        student_id: m.student_id
                    }))
                };
            });

            return teamsWithMembers;
        } catch (error) {
            console.error("Error in getTeamsByPblId:", error);
            throw error;
        }
    }

    static async getTeamsBySupervisor(pbl_id, supervisor_username) {
        try {
            const [supervisors] = await pool.execute(`
            SELECT supervisor_id 
            FROM supervisor 
            WHERE pbl_id = ? AND username = ?`,
                [pbl_id, supervisor_username]
            );

            if (supervisors.length === 0) {
                return [];
            }

            const supervisor_id = supervisors[0].supervisor_id;

            const [teams] = await pool.execute(`
            SELECT DISTINCT 
                t.team_id, 
                t.team_name, 
                t.team_info
            FROM teams t
            INNER JOIN teamXpbl tx ON t.team_id = tx.team_id
            WHERE tx.pbl_id = ? AND tx.supervisor_id = ?`,
                [pbl_id, supervisor_id]
            );
            console.log('these are the teams', teams)
            const teamIds = teams.map(team => team.team_id);
            console.log('thisis the team', teamIds)
            const placeholders = teamIds.map(() => '?').join(',');

            const [members] = await pool.execute(
                `
            SELECT 
                tx.team_id,
                u.username,
                u.full_name,
                sp.student_id
            FROM teamXpbl tx
            INNER JOIN users u ON tx.username = u.username
            LEFT JOIN studentsXpbl sp 
                ON (sp.pbl_id = tx.pbl_id AND sp.student_username = tx.username)
            WHERE tx.pbl_id = ? AND tx.team_id IN (${placeholders})
            `,
                [pbl_id, ...teamIds]
            );

            console.log('These are members', members)
            const teamsWithMembers = teams.map(team => {
                const teamMembers = members.filter(member => member.team_id === team.team_id);
                return {
                    ...team,
                    members: teamMembers.map(m => ({
                        username: m.username,
                        full_name: m.full_name,
                        student_id: m.student_id
                    }))
                };
            });

            return teamsWithMembers;
        } catch (error) {
            console.error("Error in getTeamsBySupervisor:", error);
            throw error;
        }
    }


    static async get_team_judge_marks(username, pblId, presentationType, teamId) {
    console.log(username,pblId,presentationType,teamId)
        let query = `
    SELECT
      pm.judge_username,
      pm.student_username,
      u.full_name AS student_name,
      pc.criteria_info,
      pm.marks,
      pm.comments
    FROM teamXpbl AS tx
    JOIN pbl_markings AS pm
      ON pm.pbl_id = tx.pbl_id
     AND pm.student_username = tx.username
    LEFT JOIN users AS u
      ON u.username = pm.student_username
    LEFT JOIN pbl_criteria AS pc
      ON pc.pbl_criteria_id = pm.pbl_criteria_id
    WHERE tx.pbl_id = ?
         AND tx.team_id = ?
      AND pm.presentation_type = ?
      AND pm.judge_username = ?
  `;

        const params = [pblId,teamId, presentationType, username];

        if (teamId) {
            query += ` AND tx.team_id = ?`;
            params.push(teamId);
        }

        query += ` ORDER BY tx.team_id, pm.student_username, pm.pbl_criteria_id`;

        const [rows] = await pool.query(query, params);
        return rows;
    }
}
module.exports = PBL;