const express = require("express");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/adminRoutes");
const pasienRoutes = require("./routes/pasienRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const dokterRoutes = require("./routes/dokterRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/pasien", pasienRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/dokter", dokterRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
