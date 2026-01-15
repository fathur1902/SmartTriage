const { SessionsClient } = require("dialogflow");
const pool = require("../config/db");
const { authenticateToken } = require("../middleware/authenticate");

const projectId = process.env.DIALOGFLOW_PROJECT_ID;
const sessionClient = new SessionsClient({
  keyFilename: process.env.DIALOGFLOW_KEYFILE_PATH,
});

// =============================================================
// 1️⃣ FRONTEND → BACKEND → Dialogflow
// =============================================================
exports.askChatbot = [
  authenticateToken(["pasien"]),
  async (req, res) => {
    try {
      const { message } = req.body;
      const patientId = req.user.id;

      if (!message || !patientId) {
        return res.status(400).json({ error: "Pesan atau user tidak valid." });
      }

      const sessionPath = sessionClient.sessionPath(
        projectId,
        `session-${patientId}`
      );
      const request = {
        session: sessionPath,
        queryInput: {
          text: { text: message, languageCode: "id" },
        },
      };

      const responses = await sessionClient.detectIntent(request);
      const result = responses[0].queryResult;
      const reply =
        result.fulfillmentText || "Maaf, saya belum punya jawaban untuk itu.";
      const intentName = result.intent ? result.intent.displayName : "Unknown";
      await pool.query(
        `INSERT INTO conversation_logs (patient_id, message, response) VALUES (?, ?, ?)`,
        [patientId, message, reply]
      );

      res.status(200).json({ reply, intent: intentName });
    } catch (error) {
      console.error("Error in askChatbot:", error);
      res.status(500).json({ error: "Gagal memproses permintaan." });
    }
  },
];

// =============================================================
// 2️⃣ WEBHOOK FINAL (GENERAL LOGIC + SAFETY NET)
// =============================================================
exports.triageWebhook = async (req, res) => {
  try {
    const queryResult = req.body.queryResult;
    const intentName = queryResult.intent.displayName;
    const queryText = queryResult.queryText;
    const parameters = queryResult.parameters || {};

    const session = req.body.session;
    const patientId = session.split("/").pop().replace("session-", "");
    const currentContexts = queryResult.outputContexts || [];

    // --- 0. FALLBACK HANDLER ---
    if (intentName === "Default Fallback Intent") {
      const fallbackCtx = currentContexts.find((c) =>
        c.name.endsWith("fallback-counter")
      );
      let failCount = fallbackCtx ? Number(fallbackCtx.parameters.count) : 0;
      failCount++;

      // KONDISI A: SUDAH 3 KALI GAGAL
      if (failCount >= 3) {
        await pool.query(
          `INSERT INTO triage_result (patient_id, symptom, severity, duration, priority, description, status) 
           VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [
            patientId,
            "Gagal Deteksi Keluhan",
            "-",
            "-",
            "Non-Darurat",
            "Pasien kesulitan menggunakan chatbot (3x Fallback). Butuh bantuan manual.",
          ]
        );

        // Beritahu dokter via Socket
        if (global.io) global.io.emit("update_patient_queue");

        // Respon ke Pasien & Reset Context
        return res.status(200).json({
          fulfillmentText:
            "Mohon maaf, sepertinya saya kesulitan memahami informasi Anda. Demi kenyamanan, saya akan langsung menghubungkan Anda ke antrean dokter. Mohon tunggu sebentar.",
          outputContexts: [
            { name: `${session}/contexts/fallback-counter`, lifespanCount: 0 }, // Hapus counter
            { name: `${session}/contexts/triage-data`, lifespanCount: 0 }, // Hapus data sisa
          ],
        });
      } else {
        return res.status(200).json({
          fulfillmentText:
            "Maaf, saya kurang mengerti. Bisa jelaskan keluhan Anda dengan bahasa yang lebih sederhana? (Contoh: Kepala pusing, Demam, Nyeri dada)",
          outputContexts: [
            {
              name: `${session}/contexts/fallback-counter`,
              lifespanCount: 2,
              parameters: { count: failCount },
            },
          ],
        });
      }
    }

    // --- 1. WELCOME ---
    else if (intentName === "Welcome") {
      return res.status(200).json({
        fulfillmentText:
          "Halo, saya SmartTriage. Apa keluhan utama Anda hari ini?",
      });
    }

    // --- 2. SYMPTOM INPUT ---
    else if (intentName === "Symptom Input" || intentName === "Input Gejala") {
      let detectedSymptom =
        parameters.symptom || parameters.keluhan_medis || queryText;
      if (Array.isArray(detectedSymptom))
        detectedSymptom = detectedSymptom.join(" ");

      // Simpan gejala ke context
      const outputContexts = [
        {
          name: `${session}/contexts/triage-data`,
          lifespanCount: 5,
          parameters: { symptom: detectedSymptom },
        },
      ];

      return res.status(200).json({
        fulfillmentText: `Keluhan *${detectedSymptom}* dicatat. Seberapa parah gejalanya? (Ringan/Sedang/Berat)`,
        outputContexts,
      });
    }

    // --- 3. SEVERITY INPUT ---
    else if (
      intentName === "Severity Input" ||
      intentName === "Input Keparahan"
    ) {
      let severity = parameters.severity || queryText;

      // Ambil gejala dari context sebelumnya
      const triageCtx = currentContexts.find((c) =>
        c.name.endsWith("triage-data")
      );
      const prevSymptom = triageCtx?.parameters?.symptom || "gejala";

      const outputContexts = [
        {
          name: `${session}/contexts/triage-data`,
          lifespanCount: 5,
          parameters: { symptom: prevSymptom, severity: severity },
        },
      ];

      return res.status(200).json({
        fulfillmentText: `Tingkat keparahan *${severity}* dicatat. Sudah berapa lama keluhan berlangsung?`,
        outputContexts,
      });
    }

    // ====================================================================
    // 4. DURATION INPUT (LOGIKA INTI / ALGORITMA TRIASE)
    // ====================================================================
    else if (intentName === "Duration Input" || intentName === "Input Durasi") {
      const duration = parameters.duration || queryText;

      // 1. Ambil Data Context Lengkap
      const triageCtx = currentContexts.find((ctx) =>
        ctx.name.endsWith("/contexts/triage-data")
      );
      const symptom = triageCtx?.parameters?.symptom || "Tidak diketahui";
      let severity = triageCtx?.parameters?.severity || "Tidak diketahui";
      if (Array.isArray(severity)) severity = severity.join(" ");

      // 2. Bersihkan Text untuk Pencarian Database
      const cleanSymptom = symptom
        .toLowerCase()
        .replace(/[^\w\s]/gi, " ") // Hapus simbol
        .replace(
          /\b(saya|aku|rasa|merasa|sakit|nyeri|pada|di|bagian|yg|yang|mengalami)\b/gi,
          " "
        )
        .trim();

      const searchWords = cleanSymptom.split(/\s+/).filter((w) => w.length > 2);

      // 3. Cek Database (Mencari Base Priority)
      let rule = [];
      // Coba Exact Match
      [rule] = await pool.query(
        `SELECT priority, description FROM triage_rules WHERE ? LIKE CONCAT('%', keyword, '%') LIMIT 1`,
        [symptom]
      );

      // Coba Partial Match jika Exact gagal
      if (rule.length === 0 && searchWords.length > 0) {
        const conditions = searchWords
          .map(() => "keyword LIKE CONCAT('%', ?, '%')")
          .join(" OR ");
        [rule] = await pool.query(
          `SELECT priority, description FROM triage_rules WHERE ${conditions} ORDER BY FIELD(priority, 'Emergency', 'Darurat', 'Non-Darurat') ASC LIMIT 1`,
          searchWords
        );
      }

      // Default Value dari Database
      let basePriority = rule.length ? rule[0].priority : "Non-Darurat";
      let description = rule.length
        ? rule[0].description
        : "Evaluasi gejala umum.";

      // 4. Deteksi Variabel (Severity & Keyword Kritis)
      const sevLower = severity.toLowerCase();
      const durLower = duration.toLowerCase();

      // Regex Keparahan
      const isRingan = /ringan|dikit|kecil|biasa|kurang|awal|low/i.test(
        sevLower
      );
      const isBerat =
        /berat|parah|hebat|sangat|banget|sekali|tinggi|hancur|darurat|intens/i.test(
          sevLower
        );
      const isKronis = /minggu|bulan|tahun|lama|menahun/i.test(durLower);

      // --- SAFETY NET: DETEKSI KATA KUNCI KRITIS ---
      // Jika kata-kata ini muncul, sistem dilarang menurunkan status ke "Non-Darurat" sembarangan
      const criticalKeywords =
        /sesak|napas|jantung|lumpuh|darah|kejang|kesadaran|pingsan|stroke|dada|kritis/i;
      const isCritical = criticalKeywords.test(cleanSymptom);

      let finalPriority = basePriority;
      // KASUS A: BASE EMERGENCY (Database bilang Merah)
      // ==========================================================
      // ⚖️ LOGIKA UMUM (REVISI: MENCEGAH FALSE EMERGENCY)
      // ==========================================================

      // KASUS A: BASE EMERGENCY (Database bilang Merah)
      // Contoh: "Nyeri Dada", "Sesak Napas", "Pingsan", "Lumpuh"
      if (basePriority === "Emergency") {
        if (isRingan) {
          if (isCritical) {
            // Kritis tapi ringan (Nyeri dada dikit) -> Turun ke Kuning
            finalPriority = "Darurat";
            description +=
              " (Gejala kritis tapi intensitas ringan, pantau ketat).";
          } else {
            // Database error/salah deteksi -> Turun ke Hijau
            finalPriority = "Non-Darurat";
            description += " (Kondisi stabil).";
          }
        }
        // Jika Sedang/Berat -> Tetap Emergency
      }

      // KASUS B: BASE DARURAT (Database bilang Kuning)
      // Contoh: "Demam", "Muntah", "Diare"
      else if (basePriority === "Darurat") {
        if (isRingan) {
          finalPriority = "Non-Darurat"; // Turun ke Hijau
          description += " (Kondisi ringan, aman rawat jalan).";
        } else if (isBerat) {
          // REVISI: Hanya naik ke Emergency jika ada Keyword Kritis
          // Contoh: "Demam Sangat Tinggi" -> Tetap Darurat (Kuning)
          // Contoh: "Demam + Sesak Napas" -> Emergency (Merah)
          if (isCritical) {
            finalPriority = "Emergency";
            description += " (Gejala memberat dengan tanda kritis).";
          } else {
            finalPriority = "Darurat"; // Tetap di Kuning (Mentok)
            description += " (Gejala memberat, segera periksa dokter).";
          }
        }
      }

      // KASUS C: BASE NON-DARURAT (Database bilang Hijau)
      // Contoh: "Sakit Kepala", "Gatal", "Batuk", "Nyeri Otot"
      else {
        if (isBerat) {
          // REVISI: "Sakit Kepala Sangat Berat" -> Darurat (Kuning), BUKAN Emergency
          if (isCritical) {
            finalPriority = "Emergency"; // Kecuali "Nyeri Dada Sangat Berat"
          } else {
            finalPriority = "Darurat"; // Naik 1 level saja ke Kuning
            description +=
              " (Keluhan sangat mengganggu, butuh penanganan segera).";
          }
        } else if (isKronis && !isRingan) {
          finalPriority = "Darurat"; // Kronis -> Kuning
        }
      }
      let responseText = "";
      if (finalPriority === "Emergency") {
        description = "⚠️ INDIKASI GAWAT DARURAT.";
        responseText = `
🚨 **PERINGATAN KEAMANAN** 🚨
Sistem mendeteksi: ${finalPriority}
Gejala: ${symptom} (${severity})

**Mohon Maaf, Layanan Telekonsultasi Tidak Dapat Dilanjutkan.**
Demi keselamatan nyawa, mohon JANGAN menggunakan website ini. Segera cari pertolongan medis langsung atau ke IGD terdekat.
        `.trim();
      } else {
        responseText = `
• Keluhan: ${symptom}
• Keparahan: ${severity}
• Durasi: ${duration}
• Prioritas: ${finalPriority}

Catatan: ${description}
Silakan tunggu, saya akan menghubungkan Anda dengan dokter.
        `.trim();
      }

      // Simpan ke Tabel triage_result
      await pool.query(
        `INSERT INTO triage_result (patient_id, symptom, severity, duration, priority, description, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [patientId, symptom, severity, duration, finalPriority, description]
      );

      // Trigger Socket.io (Update Dashboard Dokter)
      if (global.io) {
        global.io.emit("update_patient_queue");
      }

      // Reset Context Dialogflow (Selesai Sesi)
      return res.status(200).json({
        fulfillmentText: responseText,
        outputContexts: [
          { name: `${session}/contexts/triage-data`, lifespanCount: 0 },
        ],
      });
    }
  } catch (error) {
    console.error("Error Webhook:", error);
    return res
      .status(500)
      .json({ fulfillmentText: "Terjadi kesalahan pada sistem triase." });
  }
};
