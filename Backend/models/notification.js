const { pool } = require("../config/database");

class Notification {
  static async create(username, message, hackathon_id = null) {
    const [result] = await pool.execute(
      `INSERT INTO notifications (username, hackathon_id, message) VALUES (?, ?, ?)`,
      [username, hackathon_id, message]
    );
    return result.insertId;
  }

  static async getForUser(username) {
    const [rows] = await pool.execute(
      `SELECT * FROM notifications WHERE username = ? ORDER BY created_at DESC`,
      [username]
    );
    return rows;
  }

  static async markRead(notification_id, username) {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = 1 WHERE notification_id = ? AND username = ?`,
      [notification_id, username]
    );
    return result.affectedRows;
  }

  static async markAllRead(username) {
    const [result] = await pool.execute(
      `UPDATE notifications SET is_read = 1 WHERE username = ? AND is_read = 0`,
      [username]
    );
    return result.affectedRows;
  }
}

module.exports = Notification;
