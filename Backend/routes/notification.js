const express = require("express");
const router = express.Router();
const NotificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/auth");

router.get("/", verifyToken, NotificationController.list);
router.patch("/:id/read", verifyToken, NotificationController.markRead);
router.patch("/read-all", verifyToken, NotificationController.markAllRead);
router.post("/hackathon/:hackathon_id/declare-champion", verifyToken, NotificationController.declareChampion);

module.exports = router;
