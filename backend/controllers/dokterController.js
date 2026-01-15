const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");
const bcrypt = require("bcryptjs");

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
            c.status,       
            t.symptom,      
            t.priority     
          FROM consultations c
          JOIN patients p ON c.patient_id = p.id
          LEFT JOIN triage_result t ON c.triage_id = t.id -- Hubungkan ke tabel triage
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
          status: row.status,
          symptom: row.symptom,
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
      const { triageId, patientId } = req.body;
      const doctorId = req.user.id;

      const [triageRows] = await pool.query(
        "SELECT symptom, severity, duration, description FROM triage_result WHERE id = ?",
        [triageId]
      );

      const [result] = await pool.query(
        "INSERT INTO consultations (patient_id, doctor_id, triage_id, consultation_date, status, type) VALUES (?, ?, ?, NOW(), 'active', 'Manual')",
        [patientId, doctorId, triageId]
      );

      const consultationId = result.insertId;
      await pool.query(
        "UPDATE triage_result SET status = 'completed' WHERE id = ?",
        [triageId]
      );
      if (triageRows.length > 0) {
        const t = triageRows[0];

        const summaryMessage = `HASIL TRIASE OLEH CHATBOT: Pasien mengeluhkan ${
          t.symptom
        } dengan tingkat keparahan ${
          t.severity
        } yang telah berlangsung selama ${
          t.duration
        }. Berdasarkan analisis dari chatbot, ${
          t.description || "tidak ada catatan khusus."
        }`;
        await pool.query(
          "INSERT INTO chat_messages (consultation_id, sender_role, message) VALUES (?, 'system', ?)",
          [consultationId, summaryMessage]
        );
      }

      return res.status(200).json({
        message: "Konsultasi dimulai",
        consultationId: consultationId,
      });
    } catch (error) {
      console.error("Error startConsultation:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];

// AKHIRI KONSULTASI
exports.endConsultation = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const { consultationId, summary } = req.body;
      const doctorId = req.user.id;

      await pool.query(
        "UPDATE consultations SET status = 'done', summary=? WHERE id = ? AND doctor_id = ?",
        [summary || null, consultationId, doctorId]
      );
      if (summary) {
        await pool.query(
          "INSERT INTO chat_messages (consultation_id, sender_role, message) VALUES (?, 'system', ?)",
          [consultationId, `Catatan Oleh Dokter: ${summary}`]
        );
      }

      return res.status(200).json({ message: "Konsultasi selesai." });
    } catch (error) {
      console.error("Error endConsultation:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];
// AMBIL RIWAYAT CHAT (Untuk Dokter)
exports.getConsultationChat = [
  authenticateToken(["dokter"]),
  async (req, res) => {
    try {
      const { consultationId } = req.params;
      const [rows] = await pool.query(
        "SELECT * FROM chat_messages WHERE consultation_id = ? ORDER BY created_at ASC",
        [consultationId]
      );
      res.status(200).json({ data: rows });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error server" });
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
      const { name, spesialis, password } = req.body;
      const doctorId = req.user?.id;

      if (!name || !spesialis) {
        return res
          .status(400)
          .json({ message: "Nama dan spesialis wajib diisi" });
      }
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
          `UPDATE doctors 
           SET name = ?, spesialis = ?, password = ? 
           WHERE id = ?`,
          [name, spesialis, hashedPassword, doctorId]
        );
      } else {
        await pool.query(
          `UPDATE doctors 
           SET name = ?, spesialis = ? 
           WHERE id = ?`,
          [name, spesialis, doctorId]
        );
      }

      return res.status(200).json({ message: "Profil berhasil diperbarui" });
    } catch (error) {
      console.error("Error in updateProfile:", error);
      return res.status(500).json({ message: "Terjadi kesalahan server" });
    }
  },
];
