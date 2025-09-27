const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET;

// Middleware untuk memverifikasi token
const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token tidak ditemukan" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Token tidak valid" });
    req.user = user;
    next();
  });
};

// Mendapatkan profil admin
exports.getProfile = [
  authenticateToken,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT name, username FROM users WHERE id = ? AND role_id = 1",
        [req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Admin tidak ditemukan" });
      }
      res.status(200).json({ data: rows[0] });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// Memperbarui profil admin
exports.updateProfile = [
  authenticateToken,
  async (req, res) => {
    const { name, username, password } = req.body;
    const adminId = req.user.id;
    const updates = {};
    const params = [];
    let query = "UPDATE users SET ";
    let paramIndex = 0;

    if (name) {
      updates.name = name;
      query += "name = ?, ";
      params.push(name);
      paramIndex++;
    }
    if (username) {
      const [existingUsers] = await pool.query(
        "SELECT id FROM users WHERE username = ? AND id != ?",
        [username, adminId]
      );
      if (existingUsers.length > 0) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      updates.username = username;
      query += "username = ?, ";
      params.push(username);
      paramIndex++;
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
      query += "password = ?, ";
      params.push(hashedPassword);
      paramIndex++;
    }
    if (paramIndex === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada field yang diperbarui" });
    }
    query = query.slice(0, -2) + " WHERE id = ? AND role_id = 1";
    params.push(adminId);

    try {
      await pool.query(query, params);
      res.status(200).json({ message: "Profil admin berhasil diperbarui" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// Membuat akun dokter
exports.createDoctor = [
  authenticateToken,
  async (req, res) => {
    const { name, username, spesialis, password } = req.body;

    // Validasi input
    if (!name || !username || !spesialis || !password) {
      return res.status(400).json({ message: "Semua field wajib diisi" });
    }

    try {
      const [existingDoctors] = await pool.query(
        "SELECT id FROM doctors WHERE username = ?",
        [username]
      );
      if (existingDoctors.length > 0) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await pool.query(
        "INSERT INTO doctors (name, username, password, spesialis, role_id) VALUES (?, ?, ?, ?, (SELECT id FROM roles WHERE name = 'dokter'))",
        [name, username, hashedPassword, spesialis]
      );

      res.status(201).json({
        message: "Akun dokter berhasil dibuat",
        doctorId: result.insertId,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

//Mendapatkan daftar dokter
exports.getDoctors = [
  authenticateToken,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, username, spesialis, status FROM doctors"
      );
      res.status(200).json({ data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

//Atur status dokter
exports.toggleDoctorStatus = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params; // ID dokter dari URL
    try {
      const [doctor] = await pool.query(
        "SELECT status FROM doctors WHERE id = ?",
        [id]
      );
      if (doctor.length === 0) {
        return res.status(404).json({ message: "Dokter tidak ditemukan" });
      }

      const newStatus = doctor[0].status === "Aktif" ? "Nonaktif" : "Aktif";
      await pool.query("UPDATE doctors SET status = ? WHERE id = ?", [
        newStatus,
        id,
      ]);

      res
        .status(200)
        .json({ message: `Akun dokter ${newStatus.toLowerCase()}kan` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// Mendapatkan daftar pasien
exports.getPatients = [
  authenticateToken,
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, username, status FROM patients"
      );
      res.status(200).json({ data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// Mengaktifkan/menonaktifkan akun pasien
exports.togglePatientStatus = [
  authenticateToken,
  async (req, res) => {
    const { id } = req.params;
    try {
      const [patient] = await pool.query(
        "SELECT status FROM patients WHERE id = ?",
        [id]
      );
      if (patient.length === 0) {
        return res.status(404).json({ message: "Pasien tidak ditemukan" });
      }

      const newStatus = patient[0].status === "Aktif" ? "Diblokir" : "Aktif";
      await pool.query("UPDATE patients SET status = ? WHERE id = ?", [
        newStatus,
        id,
      ]);

      res
        .status(200)
        .json({ message: `Akun pasien ${newStatus.toLowerCase()}kan` });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// Mendapatkan statistik dashboard
exports.getDashboardStats = [
  authenticateToken,
  async (req, res) => {
    try {
      const [activePatients] = await pool.query(
        "SELECT COUNT(*) as count FROM patients WHERE status = 'Aktif'"
      );
      const [activeDoctors] = await pool.query(
        "SELECT COUNT(*) as count FROM doctors WHERE status = 'Aktif'"
      );
      // Sementara gunakan 0 untuk konsultasi karena belum ada tabel consultations
      const monthlyConsultations = 0;

      res.status(200).json({
        data: {
          activePatients: activePatients[0].count,
          activeDoctors: activeDoctors[0].count,
          monthlyConsultations: monthlyConsultations,
        },
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];
