const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { authenticateToken } = require("../middleware/authenticate");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

// Register (khusus untuk pasien) - TIDAK BERUBAH
exports.register = async (req, res) => {
  const { name, username, password, confirmPassword } = req.body;

  if (!name || !username || !password || !confirmPassword) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Kata sandi tidak cocok" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM patients WHERE username = ?",
      [username]
    );
    if (rows.length > 0) {
      return res.status(400).json({ message: "Username sudah digunakan" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO patients (name, username, password, role_id, status) VALUES (?, ?, ?, ?, 'Aktif')",
      [name, username, hashedPassword, 3]
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
        return res.status(403).json({
          message: "Akun Anda telah diblokir karena melakukan pelanggaran",
        });
      }
    }

    // Periksa status untuk dokter
    if (user.role_name === "dokter") {
      const [doctorStatus] = await pool.query(
        "SELECT account_status FROM doctors WHERE username = ?",
        [username]
      );
      // Cek apakah akun dinonaktifkan Admin
      if (doctorStatus[0].account_status === "Nonaktif") {
        return res
          .status(403)
          .json({ message: "Akun Anda telah dinonaktifkan" });
      }
      await pool.query("UPDATE doctors SET status = 'online' WHERE id = ?", [
        user.id,
      ]);
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role_name },
      SECRET_KEY,
      { expiresIn: "5h" }
    );

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
      role: user.role_name,
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

// Logout Umum (Hanya response JSON, frontend hapus token)
exports.logout = (req, res) => {
  res.status(200).json({ message: "Logout berhasil" });
};

exports.logoutDokter = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const doctorId = req.user.id;
      await pool.query("UPDATE doctors SET status = 'offline' WHERE id = ?", [
        doctorId,
      ]);

      res.status(200).json({ message: "Berhasil logout dan status offline" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Gagal logout" });
    }
  },
];

// RESET PASSWORD 
exports.resetPassword = async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;
  if (!username || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: "Semua field wajib diisi" });
  }

  if (newPassword !== confirmPassword) {
    return res
      .status(400)
      .json({ message: "Password baru dan konfirmasi tidak cocok" });
  }

  try {
    let table = "";
    const [patient] = await pool.query(
      "SELECT id FROM patients WHERE username = ?",
      [username]
    );
    if (patient.length > 0) {
      table = "patients";
    } else {
      const [doctor] = await pool.query(
        "SELECT id FROM doctors WHERE username = ?",
        [username]
      );
      if (doctor.length > 0) {
        table = "doctors";
      }
    }
    if (!table) {
      return res.status(404).json({ message: "Username tidak ditemukan." });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE ${table} SET password = ? WHERE username = ?`, [
      hashedPassword,
      username,
    ]);

    res
      .status(200)
      .json({ message: "Password berhasil diperbarui! Silakan login." });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
