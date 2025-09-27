const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

// Register (khusus untuk pasien)
exports.register = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  if (!name || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Kata sandi tidak cocok" });
  }

  try {
    // Cek duplikat username di tabel patients
    const [rows] = await pool.query(
      "SELECT * FROM patients WHERE username = ?",
      [username]
    );
    if (rows.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    // Simpan ke tabel patients dengan role_id = 3 (pasien)
    await pool.query(
      "INSERT INTO patients (name, username, password, role_id) VALUES (?, ?, ?, ?)",
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
    // Gabungkan query dari semua tabel dengan role
    const [rows] = await pool.query(
      `
        SELECT u.id, u.name, u.username, u.password, r.name AS role_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        WHERE u.username = ?
        UNION
        SELECT d.id, d.name, d.username, d.password, r.name AS role_name
        FROM doctors d
        JOIN roles r ON d.role_id = r.id
        WHERE d.username = ?
        UNION
        SELECT p.id, p.name, p.username, p.password, r.name AS role_name
        FROM patients p
        JOIN roles r ON p.role_id = r.id
        WHERE p.username = ?
      `,
      [username, username, username]
    );

    if (rows.length === 0) {
      return res.status(400).json({ message: "Username tidak ditemukan" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Kata sandi salah" });
    }
    // Periksa status untuk pasien
    if (user.role_name === "pasien") {
      const [patientStatus] = await pool.query(
        "SELECT status FROM patients WHERE username = ?",
        [username]
      );
      if (patientStatus[0].status === "Diblokir") {
        return res.status(403).json({ message: "Akun Anda telah diblokir" });
      }
    }

    // Periksa status untuk dokter
    if (user.role_name === "dokter") {
      const [doctorStatus] = await pool.query(
        "SELECT status FROM doctors WHERE username = ?",
        [username]
      );
      if (doctorStatus[0].status === "Nonaktif") {
        return res
          .status(403)
          .json({ message: "Akun Anda telah dinonaktifkan" });
      }
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      SECRET_KEY,
      { expiresIn: "5h" }
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
        redirectTo,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
