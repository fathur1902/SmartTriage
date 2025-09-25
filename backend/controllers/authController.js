const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

// Register (hanya untuk pasien)
exports.register = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  if (!name || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Kata sandi tidak cocok" });
  }

  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Set role_id ke 3 (pasien) secara default untuk registrasi
    await pool.query(
      "INSERT INTO users (name, username, password, role_id) VALUES (?, ?, ?, ?)",
      [name, username, hashedPassword, 3] // 3 adalah id untuk role 'pasien'
    );

    res.status(201).json({ message: "Registrasi berhasil" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

// Login (untuk semua role)
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username dan kata sandi wajib diisi" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT users.*, roles.name AS role_name FROM users JOIN roles ON users.role_id = roles.id WHERE username = ?",
      [username]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: "Username tidak ditemukan" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
   

    if (!isMatch) {
      return res.status(400).json({ message: "Kata sandi salah" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // Tentukan redirect berdasarkan role
    let redirectTo = "/";
    switch (user.role_name) {
      case "admin":
        redirectTo = "/admin/dashboard";
        break;
      case "dokter":
        redirectTo = "/dokter/dashboard";
        break;
      case "pasien":
        redirectTo = "/dashboard";
        break;
    }

    res.status(200).json({
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role_name,
        redirectTo, // Tambahkan redirectTo untuk frontend
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
