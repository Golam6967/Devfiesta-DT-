const {pool}= require("../config/database");
const PasswordUtils= require("../utils/passwordUtils");

class User{
    static async create_user(userData){
        const
        {
            username,
            full_name,
            email,
            password_hash,
            date_of_birth
        }= userData;

        const [result] = await pool.execute(`INSERT INTO users (
        username, full_name, email, password_hash, date_of_birth
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        username,
        full_name,
        email,
        password_hash,
        date_of_birth
      ],)
    }
    static async findByUsernameOrEmail(username, email) {
    const [users] = await pool.execute("SELECT username, email FROM users WHERE username = ? OR email = ?", [
      username,
      email,
    ])
    return users[0] || null
  }
   static async findByUsername(username) {
    console.log(username)
    const [users] = await pool.execute("SELECT * FROM users WHERE username = ?", [username])
    return users[0] || null
  }

  static async findByEmail(email) {
    const [users] = await pool.execute("SELECT * FROM users WHERE email = ?", [email])
    return users[0] || null
  }

  static async findByUsernameWithPassword(username) {
    const [users] = await pool.execute(
      "SELECT username, email, full_name, password_hash FROM users WHERE username = ?",
      [username],
    )
    return users[0] || null
  }
    static async findByEmailWithPassword(email) {
    const [users] = await pool.execute(
      "SELECT username, full_name, password_hash FROM users WHERE email = ?",
      [email],
    )
    return users[0] || null
  }
  
    static async getProfile(username) {
    const [users] = await pool.execute(
      `SELECT * FROM users WHERE username = ?`,
      [username],
    )
    return users[0] || null
  }

  static async updateProfile(username, updateData) {
    const { full_name, date_of_birth, skills, interests, achievement, bio, github_link, institution, phone, image } =
      updateData
    console.log(updateData)
    const [result] = await pool.execute(
      `UPDATE users SET 
       full_name = COALESCE(?, full_name),
       skills = COALESCE(?, skills),
       interests = COALESCE(?, interests),
       achievement = COALESCE(?, achievement),
       bio = COALESCE(?, bio),
       github_link = COALESCE(?, github_link),
       institution = COALESCE(?, institution),
       phone = COALESCE(?, phone),
       image= COALESCE(?,image)
       WHERE username = ?`,
      [full_name,skills, interests, achievement, bio, github_link, institution, phone , image, username],
    )

    return result
  }
    static async updatePassword(username, newPasswordHash) {
    const [result] = await pool.execute(
      "UPDATE users SET password_hash = ? WHERE username = ?",
      [newPasswordHash, username],
    )
    return result
  }
  static async userList() {
    const [users] = await pool.execute("SELECT username, full_name, email FROM users")
    return users
  }
//     static async deleteUser(username) {
//     const [result] = await pool.execute("DELETE FROM users WHERE username = ?", [username])
//     return result
//   }
}

module.exports = User;