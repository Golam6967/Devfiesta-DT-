const mysql = require("mysql2/promise");
require("dotenv").config();

const dataConfiguration = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // Most managed MySQL hosts (Aiven, PlanetScale, Railway, TiDB Cloud, etc.)
  // require TLS and refuse plain connections. Local Docker MySQL does not
  // need this, so it's opt-in via DB_SSL rather than always-on.
  ...(process.env.DB_SSL === "true" && {
    ssl: { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false" },
  }),
};
const pool = mysql.createPool(dataConfiguration);
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database successfully!");
    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect to MySQL database:", error.message);
    process.exit(1);
  }
};

module.exports = { pool, testConnection };
