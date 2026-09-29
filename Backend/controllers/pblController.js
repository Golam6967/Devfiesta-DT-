const PBL = require("../models/pbl");
const ResponseHandler = require("../utils/responseHandler");

class PBLController {
  static async host_pbl(req, res) {
    try {
      const { username } = req.user;
      const {
        pbl_name,
        pbl_rule_book,
        proposal_Date,
        progress_date,
        final_presentation,
        student_pass,
        judge_pass,
        supervisor_pass,
      } = req.body;

      const pbl_data = {
        pbl_name,
        pbl_rule_book,
        proposal_Date,
        progress_date,
        final_presentation,
        student_pass,
        judge_pass,
        supervisor_pass,
      };

      const pbl_id = await PBL.host_pbl(pbl_data, username);

      ResponseHandler.success(
        res,
        {
          pbl_id,
          pbl_data,
        },
        "PBL hosted successfully"
      );
    } catch (error) {
      console.error("PBL hosting failed:", error);
      ResponseHandler.error(res, "PBL hosting failed", 500, error.message);
    }
  }

  static async get_pbl_by_username(req, res) {
    try {
      const { username } = req.user;
      const pbls = await PBL.get_pbl_by_username(username);

      if (!pbls || pbls.length === 0) {
        return ResponseHandler.notFound(res, `No PBL hosted by ${username}`);
      }

      return ResponseHandler.success(
        res,
        { pbls },
        "PBLs retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving PBLs:", error);
      ResponseHandler.error(res, "Failed to retrieve PBLs", 500, error.message);
    }
  }

  static async get_all_pbl(req, res) {
    try {
      const pbls = await PBL.get_all_pbl();

      if (!pbls || pbls.length === 0) {
        return ResponseHandler.notFound(res, "No PBLs found");
      }

      return ResponseHandler.success(
        res,
        { pbls },
        "All PBLs retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving all PBLs:", error);
      ResponseHandler.error(res, "Failed to retrieve PBLs", 500, error.message);
    }
  }

  static async get_pbl_by_id(req, res) {
    try {
      const { pbl_id } = req.params;
      const pbl = await PBL.get_pbl_by_id(pbl_id);

      if (!pbl || pbl.length === 0) {
        return ResponseHandler.notFound(res, `No PBL with ID ${pbl_id} found`);
      }

      return ResponseHandler.success(
        res,
        { pbl },
        "PBL retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving PBL:", error);
      ResponseHandler.error(res, "Failed to retrieve PBL", 500, error.message);
    }
  }

  static async get_pbl_by_name(req, res) {
    try {
      const { pbl_name } = req.params;
      const pbl = await PBL.get_pbl_by_name(pbl_name);

      if (!pbl || pbl.length === 0) {
        return ResponseHandler.notFound(res, `No PBL named ${pbl_name} found`);
      }

      return ResponseHandler.success(
        res,
        { pbl },
        "PBL retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving PBL by name:", error);
      ResponseHandler.error(res, "Failed to retrieve PBL", 500, error.message);
    }
  }

  static async get_pbls_by_judge(req, res) {
    try {
      const { username } = req.user;
      const pbls = await PBL.get_pbls_by_judge(username);

      if (!pbls || pbls.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No PBLs found for judge ${username}`
        );
      }

      return ResponseHandler.success(
        res,
        { pbls },
        "PBLs retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving judge's PBLs:", error);
      ResponseHandler.error(res, "Failed to retrieve PBLs", 500, error.message);
    }
  }

  static async get_pbls_by_student(req, res) {
    try {
      const { username } = req.user;
      const pbls = await PBL.get_pbls_by_student(username);

      if (!pbls || pbls.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No PBLs found for student ${username}`
        );
      }

      return ResponseHandler.success(
        res,
        { pbls },
        "PBLs retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving student's PBLs:", error);
      ResponseHandler.error(res, "Failed to retrieve PBLs", 500, error.message);
    }
  }

  static async insert_student(req, res) {
    try {
      const { pbl_id, student_username, student_id, password } = req.body;
      const get_password = await PBL.get_student_pass(pbl_id);
      if (get_password[0].student_pass !== password) {
        console.error(
          `Incorrect password for student insertion in PBL ID: ${pbl_id}`
        );
        return ResponseHandler.error(res, "Incorrect password", 401);
      }
      const inserted = await PBL.insert_student(
        pbl_id,
        student_username,
        student_id
      );

      return ResponseHandler.success(
        res,
        { inserted },
        "Student inserted into PBL successfully"
      );
    } catch (error) {
      console.error("Error inserting student:", error);
      ResponseHandler.error(
        res,
        "Failed to insert student",
        500,
        error.message
      );
    }
  }

  static async insert_judge(req, res) {
    try {
      const { pbl_id, judge_username, judge_pass } = req.body;
      const get_password = await PBL.get_judge_pass(pbl_id);
      if (get_password[0].judge_pass !== judge_pass) {
        console.error(
          `Incorrect password for judge insertion in PBL ID: ${pbl_id}`
        );
        return ResponseHandler.error(res, "Incorrect password", 401);
      }
      const insertedId = await PBL.insert_judge(pbl_id, judge_username);

      return ResponseHandler.success(
        res,
        { insertedId },
        "Judge inserted into PBL successfully"
      );
    } catch (error) {
      console.error("Error inserting judge:", error);
      ResponseHandler.error(res, "Failed to insert judge", 500, error.message);
    }
  }

  static async insert_supervisor(req, res) {
    try {
      const { pbl_id, supervisor_username, supervisor_pass } = req.body;
      const get_password = await PBL.get_supervisor_pass(pbl_id);
      console.log(get_password);
      if (get_password[0].supervisor_pass !== supervisor_pass) {
        console.error(
          `Incorrect password for supervisor insertion in PBL ID: ${pbl_id}`
        );
        return ResponseHandler.error(res, "Incorrect password", 401);
      }
      const insertedId = await PBL.insert_supervisor(
        pbl_id,
        supervisor_username
      );

      return ResponseHandler.success(
        res,
        { insertedId },
        "Supervisor inserted into PBL successfully"
      );
    } catch (error) {
      console.error("Error inserting supervisor:", error);
      ResponseHandler.error(
        res,
        "Failed to insert supervisor",
        500,
        error.message
      );
    }
  }

  static async team_creation(req, res) {
    try {
      const { pbl_id, usernames, team_info, team_name, supervisor_username } =
        req.body;
      const team_id = await PBL.team_creation(
        pbl_id,
        usernames,
        team_info,
        team_name,
        supervisor_username
      );

      return ResponseHandler.success(
        res,
        { team_id },
        "Team created successfully"
      );
    } catch (error) {
      console.error("Error creating team:", error);
      ResponseHandler.error(res, "Failed to create team", 500, error.message);
    }
  }

  static async get_team_details(req, res) {
    try {
      const { team_id, pbl_id } = req.params;
      const teamDetails = await PBL.get_team_details(team_id, pbl_id);

      if (!teamDetails || Object.keys(teamDetails).length === 0) {
        return ResponseHandler.notFound(res, "Team details not found");
      }

      return ResponseHandler.success(
        res,
        { teamDetails },
        "Team details retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving team details:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve team details",
        500,
        error.message
      );
    }
  }

  static async judge_marking_in_pbl(req, res) {
    try {
      const { username } = req.user;
      const {
        pbl_id,
        student_username,
        pbl_criteria_ids,
        presentation_type,
        marks,
        comments,
      } = req.body;
      console.log(username);
      console.log(req.body);

      const result = await PBL.judge_marking_in_pbl(
        username,
        pbl_id,
        student_username,
        pbl_criteria_ids,
        presentation_type,
        marks,
        comments
      );

      return ResponseHandler.success(
        res,
        { result },
        "Marks submitted successfully"
      );
    } catch (error) {
      console.error("Error submitting marks:", error);
      ResponseHandler.error(res, "Failed to submit marks", 500, error.message);
    }
  }

  static async judge_mark_update_in_pbl(req, res) {
    try {
      const { username } = req.user;
      const {
        pbl_id,
        student_username,
        pbl_criteria_ids,
        presentation_type,
        marks,
        comments,
      } = req.body;
      console.log(req.body);

      const result = await PBL.judge_mark_update_in_pbl(
        username,
        pbl_id,
        student_username,
        pbl_criteria_ids,
        presentation_type,
        marks,
        comments
      );

      return ResponseHandler.success(
        res,
        { result },
        "Marks updated successfully"
      );
    } catch (error) {
      console.error("Error updating marks:", error);
      ResponseHandler.error(res, "Failed to update marks", 500, error.message);
    }
  }

  static async update_pbl_dates(req, res) {
    try {
      const { pbl_id } = req.params;
      const { proposal_Date, progress_date, final_presentation } = req.body;

      const result = await PBL.update_pbl_dates(
        pbl_id,
        proposal_Date,
        progress_date,
        final_presentation
      );

      return ResponseHandler.success(
        res,
        { result },
        "PBL dates updated successfully"
      );
    } catch (error) {
      console.error("Error updating PBL dates:", error);
      ResponseHandler.error(
        res,
        "Failed to update PBL dates",
        500,
        error.message
      );
    }
  }

  static async get_judge_marks(req, res) {
    try {
      const { username } = req.user;
      const { pbl_id, presentation_type } = req.params;
      console.log("paise naki ?");

      const marks = await PBL.get_judge_marks(
        username,
        pbl_id,
        presentation_type
      );

      if (!marks || marks.length === 0) {
        return ResponseHandler.notFound(res, "No marks found for this judge");
      }

      return ResponseHandler.success(
        res,
        { marks },
        "Judge marks retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving judge marks:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve judge marks",
        500,
        error.message
      );
    }
  }

  static async getStudentMarkings(req, res) {
    try {
      const { username } = req.user;
      const { pbl_id } = req.params;

      const markings = await PBL.getStudentMarkings(pbl_id, username);

      if (!markings || markings.length === 0) {
        return ResponseHandler.notFound(
          res,
          "No markings found for this student"
        );
      }

      return ResponseHandler.success(
        res,
        { markings },
        "Student markings retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving student markings:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve student markings",
        500,
        error.message
      );
    }
  }

  static async getTotalMarksForStudents(req, res) {
    try {
      const { pbl_id } = req.params;
      console.log("Kire chole nakie bhai");
      const results = await PBL.getTotalMarksForStudents(pbl_id);

      if (!results || results.length === 0) {
        return ResponseHandler.notFound(res, "No marks found for this PBL");
      }

      return ResponseHandler.success(
        res,
        { results },
        "Total marks retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving total marks:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve total marks",
        500,
        error.message
      );
    }
  }

  static async role_finding(req, res) {
    try {
      const { username } = req.user;
      const { pbl_id } = req.params;
      console.log(username, pbl_id);
      const role = await PBL.role_finding(username, pbl_id);

      if (!role || role.length === 0) {
        return `No Role`;
      }

      return ResponseHandler.success(
        res,
        { role },
        "Role retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving role:", error);
      ResponseHandler.error(res, "Failed to retrieve role", 500, error.message);
    }
  }
  static async getStudentsInPBL(req, res) {
    try {
      const { pbl_id } = req.params;
      const students = await PBL.getStudentsInPBL(pbl_id);

      if (!students || students.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No students found in PBL ${pbl_id}`
        );
      }

      return ResponseHandler.success(
        res,
        { students },
        "Students retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving students:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve students",
        500,
        error.message
      );
    }
  }

  static async getJudgesInPBL(req, res) {
    try {
      const { pbl_id } = req.params;
      const judges = await PBL.getJudgesInPBL(pbl_id);

      if (!judges || judges.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No judges found in PBL ${pbl_id}`
        );
      }

      return ResponseHandler.success(
        res,
        { judges },
        "Judges retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving judges:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve judges",
        500,
        error.message
      );
    }
  }
  static async getSupervisorsInPBL(req, res) {
    try {
      const { pbl_id } = req.params;
      const supervisors = await PBL.getSupervisorsInPBL(pbl_id);

      if (!supervisors || supervisors.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No supervisors found in PBL ${pbl_id}`
        );
      }

      return ResponseHandler.success(
        res,
        { supervisors },
        "Supervisors retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving supervisors:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve supervisors",
        500,
        error.message
      );
    }
  }
  static async getSupervisorUsername(req, res) {
    try {
      const { supervisor_id } = req.params; // get id from URL
      const supervisor = await PBL.get_supervisor_username_by_id(supervisor_id);

      if (supervisor.length === 0) {
        return ResponseHandler.notFound(
          res,
          `Supervisor with ID ${supervisor_id} not found`
        );
      }

      return ResponseHandler.success(
        res,
        supervisor[0],
        `Supervisor username fetched successfully`
      );
    } catch (error) {
      console.error("Error fetching supervisor username:", error);
      return ResponseHandler.error(
        res,
        "Failed to fetch supervisor username",
        500,
        error.message
      );
    }
  }
  static async submitPBLFile(req, res) {
    try {
      const { pbl_id, team_id, file_link, presentation_type } = req.body;

      const submission = await PBL.pbl_file_sub(
        pbl_id,
        team_id,
        file_link,
        presentation_type
      );

      return ResponseHandler.success(
        res,
        { submission },
        "PBL file submitted successfully"
      );
    } catch (error) {
      console.error("Error submitting PBL file:", error);
      ResponseHandler.error(
        res,
        "Failed to submit PBL file",
        500,
        error.message
      );
    }
  }

  static async getPBLFiles(req, res) {
    try {
      const { pbl_id, team_id } = req.params;
      console.log(pbl_id, team_id);

      const files = await PBL.get_pbl_file_sub(pbl_id, team_id);

      if (!files || files.length === 0) {
        console.log("kisui nai");
        return ResponseHandler.notFound(
          res,
          "No files found for this team in the PBL"
        );
      }

      return ResponseHandler.success(
        res,
        { files },
        "PBL files retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving PBL files:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve PBL files",
        500,
        error.message
      );
    }
  }

  static async get_team_information_by_username(req, res) {
    try {
      const { username, pbl_id } = req.query;
      console.log("koi");
      const team_information = await PBL.get_student_team_information(
        username,
        pbl_id
      );
      if (team_information.affectedRows === 0) {
        return ResponseHandler.notFound(res, `User is not in any team`);
      }

      return ResponseHandler.success(
        res,
        { team_information },
        `team information fetched successfully`
      );
    } catch (error) {
      console.error(`Error fetching team information:`, error);
      ResponseHandler.error(
        res,
        `failed fetching team information`,
        500,
        error.message
      );
    }
  }

  static async updatePBLFile(req, res) {
    try {
      const { pbl_id, team_id, file_link, presentation_type } = req.body;

      const update = await PBL.update_pbl_file_sub(
        pbl_id,
        team_id,
        file_link,
        presentation_type
      );

      if (update.affectedRows === 0) {
        return ResponseHandler.notFound(
          res,
          "File not found or no changes made"
        );
      }

      return ResponseHandler.success(
        res,
        { update },
        "PBL file updated successfully"
      );
    } catch (error) {
      console.error("Error updating PBL file:", error);
      ResponseHandler.error(
        res,
        "Failed to update PBL file",
        500,
        error.message
      );
    }
  }
  static async get_all_teams_in_pbl(req, res) {
    try {
      const { pbl_id } = req.params;
      const teams = await PBL.getTeamsByPblId(pbl_id);
      if (!teams || teams.length === 0) {
        return ResponseHandler.notFound(res, `No teams found in PBL ${pbl_id}`);
      }

      return ResponseHandler.success(
        res,
        { teams },
        `teams fetched successfully`
      );
    } catch (error) {
      console.error(`Error fetching teams:`, error);
      ResponseHandler.error(res, `failed fetching teams`, 500, error.message);
    }
  }

  static async get_all_teams_of_supervisor(req, res) {
    try {
      const { pbl_id } = req.params;
      const { username } = req.user;
      console.log(pbl_id);
      console.log(username);
      console.log("Chole re");
      const teams = await PBL.getTeamsBySupervisor(pbl_id, username);

      if (!teams || teams.length === 0) {
        return ResponseHandler.notFound(
          res,
          `No teams found for supervisor ${username} in PBL ${pbl_id}`
        );
      }

      return ResponseHandler.success(
        res,
        { teams },
        "Teams retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving teams by supervisor:", error);
      ResponseHandler.error(
        res,
        "Failed to retrieve teams",
        500,
        error.message
      );
    }
  }
  static async get_team_judge_marks(req, res) {
    try {
      const { username } = req.user;
      const { pbl_id, presentation_type } = req.params; // required
      const { team_id } = req.query; // optional filter

      if (!username) {
        return ResponseHandler.unauthorized(res, "Unauthorized: missing user");
      }
      const pblIdNum = Number(pbl_id);
      const presTypeNum = Number(presentation_type);
      if (!Number.isInteger(pblIdNum) || !Number.isInteger(presTypeNum)) {
        return ResponseHandler.badRequest(
          res,
          "pbl_id and presentation_type must be integers"
        );
      }
      let teamIdNum = undefined;
      if (team_id !== undefined) {
        teamIdNum = Number(team_id);
        if (!Number.isInteger(teamIdNum)) {
          return ResponseHandler.badRequest(
            res,
            "team_id must be an integer when provided"
          );
        }
      }

      const marks = await PBL.get_team_judge_marks(
        username,
        pblIdNum,
        presTypeNum,
        teamIdNum
      );

      if (!marks || marks.length === 0) {
        return ResponseHandler.notFound(
          res,
          "No marks found for this judge/team"
        );
      }

      return ResponseHandler.success(
        res,
        { marks },
        "Team judge marks retrieved successfully"
      );
    } catch (error) {
      console.error("Error retrieving team judge marks:", error);
      return ResponseHandler.error(
        res,
        "Failed to retrieve team judge marks",
        500,
        error.message
      );
    }
  }
}
module.exports = PBLController;
