const { Server } = require("socket.io");

let io = null;

function initSocket(server) {
    const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
        .split(",")
        .map((origin) => origin.trim());

    io = new Server(server, {
        cors: {
            origin: allowedOrigins,
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        socket.on("join-leaderboard", (hackathonId) => {
            if (hackathonId) socket.join(`hackathon:${hackathonId}`);
        });

        socket.on("leave-leaderboard", (hackathonId) => {
            if (hackathonId) socket.leave(`hackathon:${hackathonId}`);
        });
    });

    return io;
}

function emitLeaderboardUpdate(hackathonId, leaderboard) {
    if (io) io.to(`hackathon:${hackathonId}`).emit("leaderboard:update", leaderboard);
}

module.exports = { initSocket, emitLeaderboardUpdate };
