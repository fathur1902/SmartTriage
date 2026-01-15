const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const pasienRoutes = require("./routes/pasienRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const dokterRoutes = require("./routes/dokterRoutes");
const pool = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pasien", pasienRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/dokter", dokterRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});
global.io = io;
io.on("connection", (socket) => {
  // console.log("User connected:", socket.id);
  socket.on("join_room", (consultationId) => {
    const room = String(consultationId);
    socket.join(room);
    // console.log(`User joined room: ${room}`);
  });
  socket.on("send_message", async (data) => {
    const { consultationId, message, senderRole, time } = data;
    try {
      await pool.query(
        "INSERT INTO chat_messages (consultation_id, sender_role, message) VALUES (?, ?, ?)",
        [consultationId, senderRole, message]
      );
    } catch (err) {
      console.error("Gagal simpan chat:", err);
    }
    io.to(String(consultationId)).emit("receive_message", data);
  });
  socket.on("end_session", (consultationId) => {
    io.to(String(consultationId)).emit("session_ended");
  });

  socket.on("disconnect", () => {
    // console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
