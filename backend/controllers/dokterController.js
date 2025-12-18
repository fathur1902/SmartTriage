const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");

// === DASHBOARD STATS ===
exports.getDashboardStats = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const doctorId = req.user.id;
      const [todayResult] = await pool.query(
        `SELECT COUNT(*) as count FROM triage_result WHERE DATE(created_at) = CURDATE()`
      );
      const [completedResult] = await pool.query(
        `SELECT COUNT(*) as count FROM consultations WHERE doctor_id = ?`,
        [doctorId]
      );

      const [pendingResult] = await pool.query(
        `SELECT COUNT(*) as count FROM triage_result WHERE status = 'pending' AND priority IN ('Darurat', 'Non-Darurat')`
      );

      res.status(200).json({
        success: true,
        data: {
          todayPatients: todayResult[0].count,
          completedConsultations: completedResult[0].count,
          pendingQueue: pendingResult[0].count,
        },
      });
    } catch (error) {
      console.error("Error getDashboardStats:", error);
      res.status(500).json({ message: "Gagal mengambil data dashboard." });
    }
  },
];

// === DAFTAR PASIEN MASUK ===
exports.getIncomingPatients = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const { status } = req.query;
      const filterStatus = status === "completed" ? "completed" : "pending";

      const [patients] = await pool.query(
        `
        SELECT 
          t.id,          -- Gunakan 'id' biasa agar cocok dengan frontend p.id
          t.patient_id,
          u.name AS patient_name,
          t.symptom,
          t.severity,
          t.duration,
          t.priority,
          t.description,
          t.created_at,
          t.status
        FROM triage_result t
        LEFT JOIN patients u ON t.patient_id = u.id
        WHERE t.status = ?
        AND t.priority IN ('Darurat', 'Non-Darurat')
        ORDER BY
          CASE WHEN t.status = 'pending' THEN 0 ELSE 1 END,
          FIELD(t.priority, 'Darurat', 'Non-Darurat'),
          t.created_at DESC
        `,
        [filterStatus]
      );

      res.status(200).json({
        success: true,
        total: patients.length,
        data: patients,
      });
    } catch (error) {
      console.error("Error getIncomingPatients:", error);
      res.status(500).json({ message: "Gagal mengambil data triase pasien." });
    }
  },
];

// ubah ke completed
exports.markTriageComplete = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    const { triageId } = req.params;

    if (!triageId) {
      return res.status(400).json({ message: "ID Triage diperlukan." });
    }

    try {
      const [result] = await pool.query(
        `UPDATE triage_result SET status = 'completed' WHERE id = ?`,
        [triageId]
      );

      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ message: "Data triage tidak ditemukan." });
      }

      res.status(200).json({
        success: true,
        message: "Status triage berhasil diperbarui menjadi selesai.",
      });
    } catch (error) {
      console.error("Error markTriageComplete:", error);
      res.status(500).json({ message: "Gagal memperbarui status triage." });
    }
  },
];

// === RIWAYAT PASIEN (KELOMPOKAN) ===
exports.getPatientHistory = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const doctorId = req.user?.id;
      if (!doctorId) return res.status(401).json({ message: "Unauthorized" });

      const [rows] = await pool.query(
        `SELECT 
           p.id AS patient_id,
           p.name AS patient_name,
           c.id AS consultation_id,
           DATE_FORMAT(c.consultation_date, '%Y-%m-%d %H:%i') AS date,
           COALESCE(c.summary, '') AS summary,
           c.type,
           c.priority
         FROM consultations c
         JOIN patients p ON c.patient_id = p.id
         WHERE c.doctor_id = ?
         ORDER BY p.name, c.consultation_date DESC`,
        [doctorId]
      );

      const grouped = rows.reduce((acc, row) => {
        const key = row.patient_id;
        if (!acc[key]) {
          acc[key] = {
            patientId: row.patient_id,
            patientName: row.patient_name,
            consultations: [],
          };
        }
        acc[key].consultations.push({
          id: row.consultation_id,
          date: row.date,
          summary:
            row.type === "Chatbot"
              ? `Triase Otomatis: ${row.summary} (Prioritas: ${
                  row.priority || "Tidak diketahui"
                })`
              : row.summary || "Konsultasi Manual",
        });
        return acc;
      }, {});

      const result = Object.values(grouped).map((p) => ({
        patientId: p.patientId,
        patientName: p.patientName,
        totalConsultations: p.consultations.length,
        latestDate: p.consultations[0]?.date || "-",
        consultations: p.consultations,
      }));

      return res.status(200).json({
        message: "Riwayat pasien yang pernah berkonsultasi",
        data: result,
      });
    } catch (error) {
      console.error("Error in getPatientHistory:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// === MULAI KONSULTASI ===
exports.startConsultation = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const { consultationId } = req.query;
      const doctorId = req.user?.id;
      if (!doctorId || !consultationId) {
        return res.status(400).json({ message: "Data tidak lengkap" });
      }

      const [consultation] = await pool.query(
        `SELECT c.id, p.name, COALESCE(c.summary, '') as initialMessage
         FROM consultations c
         JOIN patients p ON c.patient_id = p.id
         WHERE c.id = ? AND c.doctor_id = ?`,
        [consultationId, doctorId]
      );

      if (consultation.length === 0) {
        return res.status(404).json({ message: "Konsultasi tidak ditemukan" });
      }

      return res.status(200).json({
        message: "Konsultasi dimulai",
        data: {
          patientName: consultation[0].name,
          initialMessage: consultation[0].initialMessage,
        },
      });
    } catch (error) {
      console.error("Error in startConsultation:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// === KIRIM PESAN DOKTER (LANGSUNG KE PASIEN) ===
exports.sendMessageAndSaveDiagnosis = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    const { consultationId, message } = req.body;
    const doctorId = req.user?.id;

    try {
      if (!doctorId || !consultationId || !message) {
        return res.status(400).json({ message: "Data tidak lengkap" });
      }

      // Simpan pesan dokter sebagai baris baru
      await pool.query(
        `INSERT INTO consultations 
         (patient_id, doctor_id, consultation_date, summary, type)
         SELECT patient_id, ?, NOW(), ?, 'Manual'
         FROM consultations WHERE id = ?`,
        [doctorId, `Dokter: ${message}`, consultationId]
      );

      // Respons langsung (tanpa delay)
      return res.status(200).json({
        message: "Pesan terkirim",
        data: { success: true },
      });
    } catch (error) {
      console.error("Error in sendMessageAndSaveDiagnosis:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// === PROFIL DOKTER ===
exports.getProfile = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const doctorId = req.user?.id;
      const [doctor] = await pool.query(
        `SELECT name, spesialis, account_status 
         FROM doctors 
         WHERE id = ?`,
        [doctorId]
      );

      if (doctor.length === 0) {
        return res.status(404).json({ message: "Dokter tidak ditemukan" });
      }

      // Cek apakah akun aktif (opsional, untuk keamanan ganda)
      if (doctor[0].account_status === "Nonaktif") {
        return res
          .status(403)
          .json({ message: "Akun Anda berstatus Nonaktif" });
      }

      return res.status(200).json({
        success: true,
        data: doctor[0],
      });
    } catch (error) {
      console.error("Error in getProfile:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// === UPDATE PROFILE DOKTER ===
exports.updateProfile = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const { name, spesialis } = req.body;
      const doctorId = req.user?.id;

      if (!name || !spesialis) {
        return res
          .status(400)
          .json({ message: "Nama dan spesialis wajib diisi" });
      }
      await pool.query(
        `UPDATE doctors 
         SET name = ?, spesialis = ? 
         WHERE id = ?`,
        [name, spesialis, doctorId]
      );

      return res.status(200).json({ message: "Profil berhasil diperbarui" });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];
