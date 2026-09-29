const express = require("express");
const router = express.Router();
const PBLController = require("../controllers/pblController");
const { verifyToken } = require("../middleware/auth");

router.post("/host", verifyToken, PBLController.host_pbl);
router.get(
  "/get_team_information_by_username",
  verifyToken,
  PBLController.get_team_information_by_username
);
router.get("/my-pbls", verifyToken, PBLController.get_pbl_by_username);
router.get("/all-pbls", PBLController.get_all_pbl);
router.get("/:pbl_id", PBLController.get_pbl_by_id);
router.get("/name/:pbl_name", PBLController.get_pbl_by_name);
router.put(
  "/:pbl_id/update-dates",
  verifyToken,
  PBLController.update_pbl_dates
);

router.get("/judge/my-pbls", verifyToken, PBLController.get_pbls_by_judge);
router.get("/student/my-pbls", verifyToken, PBLController.get_pbls_by_student);

router.post("/insert-student", verifyToken, PBLController.insert_student);
router.post("/insert-judge", verifyToken, PBLController.insert_judge);
router.post("/insert-supervisor", verifyToken, PBLController.insert_supervisor);

router.post("/team-creation", verifyToken, PBLController.team_creation);
router.get(
  "/team/:team_id/pbl/:pbl_id",
  verifyToken,
  PBLController.get_team_details
);

router.post("/judge/marking", verifyToken, PBLController.judge_marking_in_pbl);
router.put(
  "/judge/update-marking",
  verifyToken,
  PBLController.judge_mark_update_in_pbl
);
router.get(
  "/judge/:pbl_id/marks/:presentation_type",
  verifyToken,
  PBLController.get_judge_marks
);
router.get(
  "/student/:pbl_id/markings",
  verifyToken,
  PBLController.getStudentMarkings
);
router.get("/:pbl_id/total-marks", PBLController.getTotalMarksForStudents);

router.get("/:pbl_id/role", verifyToken, PBLController.role_finding);

router.get("/:pbl_id/students", verifyToken, PBLController.getStudentsInPBL);
router.get("/:pbl_id/judges", verifyToken, PBLController.getJudgesInPBL);
router.get(
  "/:pbl_id/supervisors",
  verifyToken,
  PBLController.getSupervisorsInPBL
);

router.post("/file-submission", verifyToken, PBLController.submitPBLFile);
router.get(
  "/:pbl_id/team/:team_id/files",
  verifyToken,
  PBLController.getPBLFiles
);
router.put("/file-update", verifyToken, PBLController.updatePBLFile);

router.get(
  "/get_all_teams_in_pbl/:pbl_id",
  verifyToken,
  PBLController.get_all_teams_in_pbl
);
router.get(
  "/get_all_teams_of_supervisor/:pbl_id",
  verifyToken,
  PBLController.get_all_teams_of_supervisor
);
router.get(
  "/supervisor/:supervisor_id/username",
  verifyToken,
  PBLController.getSupervisorUsername
);
router.get(
  "/:pbl_id/marks/:presentation_type",
  verifyToken,
  PBLController.get_team_judge_marks
);

module.exports = router;
