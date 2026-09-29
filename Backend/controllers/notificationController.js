const Notification = require("../models/notification");
const Team = require("../models/participants");
const Hackathon = require("../models/hackathon");
const ResponseHandler = require("../utils/responseHandler");

class NotificationController {
  static async list(req, res) {
    try {
      const { username } = req.user;
      const notifications = await Notification.getForUser(username);
      return ResponseHandler.success(res, { notifications });
    } catch (error) {
      console.error("Notification list error:", error);
      return ResponseHandler.error(res, "Failed to fetch notifications", 500, error.message);
    }
  }

  static async markRead(req, res) {
    try {
      const { username } = req.user;
      const { id } = req.params;
      await Notification.markRead(id, username);
      return ResponseHandler.success(res, {}, "Notification marked as read");
    } catch (error) {
      console.error("Notification markRead error:", error);
      return ResponseHandler.error(res, "Failed to update notification", 500, error.message);
    }
  }

  static async markAllRead(req, res) {
    try {
      const { username } = req.user;
      await Notification.markAllRead(username);
      return ResponseHandler.success(res, {}, "All notifications marked as read");
    } catch (error) {
      console.error("Notification markAllRead error:", error);
      return ResponseHandler.error(res, "Failed to update notifications", 500, error.message);
    }
  }

  static async declareChampion(req, res) {
    try {
      const { hackathon_id } = req.params;
      const { username } = req.user;

      const [hackathonRow] = await Hackathon.get_hackathon_by_id(hackathon_id);
      if (!hackathonRow) return ResponseHandler.notFound(res, "Hackathon");

      if (hackathonRow.host_username !== username) {
        return ResponseHandler.forbidden(res, "Only the host can declare a champion");
      }

      const leaderboard = await Team.leader_board(hackathon_id);
      if (!leaderboard || leaderboard.length === 0) {
        return ResponseHandler.notFound(res, "No leaderboard data to declare a champion from");
      }

      const champion = leaderboard.find((row) => Number(row.team_rank) === 1) || leaderboard[0];

      const message = `🏆 ${champion.team_name} has been declared champion of "${hackathonRow.hackathon_name}" with ${Number(champion.total_marks) || 0} points!`;
      await Notification.create(username, message, hackathon_id);

      return ResponseHandler.success(res, { champion, message }, "Champion declared successfully");
    } catch (error) {
      console.error("Declare champion error:", error);
      return ResponseHandler.error(res, "Failed to declare champion", 500, error.message);
    }
  }
}

module.exports = NotificationController;
