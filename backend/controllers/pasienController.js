const { authenticateToken } = require("../middleware/authenticate");
const pool = require("../config/db");
const bcrypt = require("bcryptjs"); // Pastikan bcrypt diinstall (npm install bcrypt)

exports.getProfile = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name,username FROM patients WHERE id = ?",
        [req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ message: "Pasien tidak ditemukan" });
      }
      res.status(200).json({
        message: "Profil pasien",
        data: rows[0],
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

exports.updateProfile = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    const { name, username, password } = req.body;
    const patientId = req.user.id;
    const updates = {};
    const params = [];
    let query = "UPDATE patients SET ";
    let paramIndex = 0;

    if (name) {
      updates.name = name;
      query += "name = ?, ";
      params.push(name);
      paramIndex++;
    }
    if (username) {
      const [existingPatients] = await pool.query(
        "SELECT id FROM patients WHERE username = ? AND id != ?",
        [username, patientId]
      );
      if (existingPatients.length > 0) {
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
        .json({ message: "Tidak ada data untuk diperbarui" });
    }

    // Hapus koma terakhir dan tambahkan WHERE
    query = query.slice(0, -2) + " WHERE id = ?";
    params.push(patientId);

    try {
      await pool.query(query, params);
      res.status(200).json({ message: "Profil berhasil diperbarui" });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

exports.getDashboard = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    try {
      const patientId = req.user.id;

      // 1. Hitung Konsultasi Selesai (Dari tabel consultations)
      // Asumsi: Setiap row di consultations adalah sesi konsultasi
      const [consultationCount] = await pool.query(
        "SELECT COUNT(*) as count FROM consultations WHERE patient_id = ?",
        [patientId]
      );
      const [triageCount] = await pool.query(
        "SELECT COUNT(*) as count FROM triage_result WHERE patient_id = ?",
        [patientId]
      );
      const [onlineDoctors] = await pool.query(
        "SELECT COUNT(*) as count FROM doctors WHERE status = 'online'"
      );
      const doctorStatusDisplay =
        onlineDoctors[0].count > 0
          ? `${onlineDoctors[0].count} Dokter Online`
          : "Tidak ada Dokter Online";

      const dashboardData = {
        completedConsultations: consultationCount[0].count,
        chatbotHistory: triageCount[0].count, 
        doctorStatus: doctorStatusDisplay, 
      };

      res.status(200).json({
        message: "Data dashboard pasien",
        data: dashboardData,
      });
    } catch (error) {
      console.error("Error in getDashboard:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

exports.getConsultationHistory = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT c.id, c.consultation_date, d.name AS doctor, c.summary, c.type FROM consultations c LEFT JOIN doctors d ON c.doctor_id = d.id WHERE c.patient_id = ? ORDER BY c.consultation_date DESC",
        [req.user.id]
      );
      res.status(200).json({
        message: "Riwayat konsultasi",
        data: rows,
      });
    } catch (error) {
      console.error("Error in getConsultationHistory:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

exports.sendConsultationMessage = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    const { message, doctorId } = req.body;
    try {
      const [patient] = await pool.query(
        "SELECT id FROM patients WHERE id = ?",
        [req.user.id]
      );
      if (patient.length === 0) {
        return res.status(404).json({ message: "Pasien tidak ditemukan" });
      }
      await pool.query(
        "INSERT INTO consultations (patient_id, doctor_id, consultation_date, summary, type) VALUES (?, ?, NOW(), ?, 'Text')",
        [req.user.id, doctorId || null, message]
      );
      setTimeout(async () => {
        await pool.query(
          "INSERT INTO consultations (patient_id, doctor_id, consultation_date, summary, type) VALUES (?, ?, NOW(), ?, 'Text')",
          [
            req.user.id,
            doctorId || null,
            "Terima kasih atas penjelasannya. Saya sarankan istirahat dan minum obat.",
          ]
        );
        res.status(200).json({
          message: "Pesan berhasil dikirim",
          data: { success: true },
        });
      }, 1000);
    } catch (error) {
      console.error("Error in sendConsultationMessage:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

exports.getDoctorsList = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    try {
      const [rows] = await pool.query(
        "SELECT id, name, spesialis, status FROM doctors"
      );
      res.status(200).json({
        message: "Daftar dokter",
        data: rows,
      });
    } catch (error) {
      console.error("Error in getDoctorsList:", error);
      res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];
