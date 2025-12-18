const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { authenticateToken } = require("../middleware/authenticate");

// Mendapatkan profil admin
exports.getProfile = [
  authenticateToken(["admin"]),
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
  authenticateToken(["admin"]),
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
  authenticateToken(["admin"]),
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
  authenticateToken(["admin"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, username, spesialis, status, account_status FROM doctors"
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
  authenticateToken(["admin"]),
  async (req, res) => {
    const { id } = req.params; 
    try {
      const [doctor] = await pool.query(
        "SELECT account_status FROM doctors WHERE id = ?",
        [id]
      );

      if (doctor.length === 0) {
        return res.status(404).json({ message: "Dokter tidak ditemukan" });
      }
      const currentStatus = doctor[0].account_status;
      const newStatus = currentStatus === "Aktif" ? "Nonaktif" : "Aktif";
      await pool.query("UPDATE doctors SET account_status = ? WHERE id = ?", [
        newStatus,
        id,
      ]);
      if (newStatus === "Nonaktif") {
        await pool.query("UPDATE doctors SET status = 'offline' WHERE id = ?", [
          id,
        ]);
      }

      res.status(200).json({
        message: `Akun dokter berhasil di${
          newStatus === "Aktif" ? "aktifkan" : "nonaktifkan"
        }`,
        newStatus: newStatus, 
      });
    } catch (error) {
      console.error("Error toggleDoctorStatus:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// Mendapatkan daftar pasien
exports.getPatients = [
  authenticateToken(["admin"]),
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
  authenticateToken(["admin"]),
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
  authenticateToken(["admin"]),
  async (req, res) => {
    try {
      const [patients] = await pool.query(
        "SELECT COUNT(*) as count FROM patients WHERE status = 'Aktif'"
      );
      const [doctors] = await pool.query(
        "SELECT COUNT(*) as count FROM doctors WHERE status != 'Nonaktif'"
      );
      const [consultations] = await pool.query(
        `SELECT COUNT(*) as count FROM consultations 
         WHERE MONTH(consultation_date) = MONTH(CURRENT_DATE()) 
         AND YEAR(consultation_date) = YEAR(CURRENT_DATE())`
      );

      res.status(200).json({
        success: true,
        data: {
          activePatients: patients[0].count,
          activeDoctors: doctors[0].count,
          monthlyConsultations: consultations[0].count,
        },
      });
    } catch (error) {
      console.error("Error admin dashboard:", error);
      res.status(500).json({ message: "Gagal memuat data dashboard." });
    }
  },
];
