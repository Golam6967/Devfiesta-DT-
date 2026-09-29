require('dotenv').config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/project");
const hackathonRoutes= require("./routes/hackathon");
const participationRoutes = require('./routes/participation')
const { testConnection } = require("./config/database");
const pblRoutes= require('./routes/pbl')
const notificationRoutes = require('./routes/notification')
const app = express();


console.log("DB_HOST:", process.env.DB_HOST);
testConnection();

// CORS_ORIGIN accepts a single URL or a comma-separated list (e.g. your Vercel
// production URL plus its preview deployments). Falls back to the local Vite
// dev server so local development needs no .env changes.
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.use("/api/project", projectRoutes);

app.use("/api/hackathon",hackathonRoutes);
app.use('/api/participation',participationRoutes)
app.use(`/api/pbl`,pblRoutes);
app.use('/api/notifications', notificationRoutes);

app.get("/", (req, res) => {
  res.send("API is working!");
});

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
  console.error("🔥 Uncaught Exception:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("💥 Unhandled Rejection:", reason);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
