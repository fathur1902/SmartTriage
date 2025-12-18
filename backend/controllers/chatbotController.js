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

      // Simpan log percakapan
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
// 2️⃣ WEBHOOK (PENERJEMAH & LOGIKA TRIAGE)
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

    // ==========================================
    // 0. FALLBACK HANDLER
    // ==========================================
    if (intentName === "Default Fallback Intent") {
      const contextName = `${session}/contexts/fallback-counter`;
      const existingContext = currentContexts.find(
        (ctx) => ctx.name === contextName
      );
      let count =
        existingContext && existingContext.parameters
          ? existingContext.parameters.count
          : 0;
      count++;

      let fulfillmentText = "";
      let outputContexts = [];

      if (count >= 3) {
        fulfillmentText =
          "Maaf, saya kesulitan memahami kondisi Anda. Demi keselamatan, mohon segera hubungi dokter secara manual.";
        outputContexts = [
          { name: contextName, lifespanCount: 0, parameters: {} },
        ];
      } else {
        fulfillmentText = `Maaf, saya kurang mengerti (${count}/3). Bisa jelaskan lebih sederhana?`;
        outputContexts = [
          { name: contextName, lifespanCount: 2, parameters: { count: count } },
        ];
      }
      return res.status(200).json({ fulfillmentText, outputContexts });
    }

    // ===================== 1. WELCOME =====================
    else if (intentName === "Welcome") {
      return res.status(200).json({
        fulfillmentText:
          "Halo, saya SmartTriage. Apa keluhan utama Anda hari ini?",
      });
    }

    // ===================== 2. SYMPTOM INPUT =====================
    else if (intentName === "Symptom Input" || intentName === "Input Gejala") {
      // 🛡️ AUTO-KOREKSI: Cek apakah Context triage-data SUDAH ADA?
      // Jika sudah ada, berarti user sebenarnya sedang menjawab SEVERITY, tapi Dialogflow salah deteksi.
      const existingTriageCtx = currentContexts.find((ctx) =>
        ctx.name.endsWith("/contexts/triage-data")
      );

      // Jika Context ada DAN symptom sudah terisi sebelumnya
      if (existingTriageCtx && existingTriageCtx.parameters.symptom) {
        console.log(
          "⚠️ AUTO-CORRECTION: Terdeteksi loop, mengalihkan ke Logic Severity."
        );

        // --- PAKSA JALANKAN LOGIKA SEVERITY DI SINI ---
        let severity = queryText; // Gunakan input user sebagai severity
        const previousSymptom = existingTriageCtx.parameters.symptom;

        const fulfillmentText = `Tingkat keparahan *${severity}* dicatat. Sudah berapa lama keluhan ini berlangsung?`;
        const outputContexts = [
          {
            name: `${session}/contexts/triage-data`,
            lifespanCount: 5,
            parameters: {
              symptom: previousSymptom, // Pastikan symptom lama tidak hilang
              severity: severity,
            },
          },
        ];
        return res.status(200).json({ fulfillmentText, outputContexts });
      }

      // --- JIKA MURNI INPUT GEJALA BARU ---
      let detectedSymptom = parameters.symptom || parameters.keluhan_medis;

      if (Array.isArray(detectedSymptom)) {
        detectedSymptom = detectedSymptom.join(" ");
      }

      const finalSymptom = detectedSymptom || queryText;

      // console.log(`✅ SIMPAN GEJALA: "${finalSymptom}"`);

      const fulfillmentText = `Terima kasih, keluhan *${finalSymptom}* tercatat. Seberapa parah gejalanya? (Ringan/Sedang/Berat)`;

      const outputContexts = [
        {
          name: `${session}/contexts/triage-data`,
          lifespanCount: 5,
          parameters: { symptom: finalSymptom },
        },
      ];

      return res.status(200).json({ fulfillmentText, outputContexts });
    }

    // ===================== 3. SEVERITY INPUT =====================
    else if (
      intentName === "Severity Input" ||
      intentName === "Input Keparahan"
    ) {
      let severity = parameters.severity || parameters.Severity || queryText;
      if (Array.isArray(severity)) severity = severity.join(" ");

      const triageCtx = currentContexts.find((ctx) =>
        ctx.name.endsWith("/contexts/triage-data")
      );
      const previousSymptom =
        triageCtx?.parameters?.symptom || "Tidak diketahui";

      const fulfillmentText = `Tingkat keparahan *${severity}* dicatat. Sudah berapa lama?`;

      const outputContexts = [
        {
          name: `${session}/contexts/triage-data`,
          lifespanCount: 5,
          parameters: {
            symptom: previousSymptom,
            severity: severity,
          },
        },
      ];
      return res.status(200).json({ fulfillmentText, outputContexts });
    }

    // ===================== 4. DURATION INPUT (FINAL LOGIC) =====================
    else if (intentName === "Duration Input" || intentName === "Input Durasi") {
      const duration = parameters.duration || queryText;

      const triageCtx = currentContexts.find((ctx) =>
        ctx.name.endsWith("/contexts/triage-data")
      );
      const symptom = triageCtx?.parameters?.symptom || "Tidak diketahui";

      let severityRaw = triageCtx?.parameters?.severity || "Tidak diketahui";
      if (Array.isArray(severityRaw)) severityRaw = severityRaw.join(" ");
      const severity = severityRaw;

      // console.log(
      //   `🔍 ANALISA DATABASE UNTUK: "${symptom}" dengan KEPARAHAN: "${severity}"`
      // );
      const cleanSymptom = symptom
        .replace(
          /\b(ini|itu|saya|aku|rasa|terasa|banget|sangat|yang|di|ke)\b/gi,
          " "
        )
        .trim();
      const words = cleanSymptom.split(/\s+/).filter((w) => w.length > 2);

      let rule = [];

      // 1. Coba Exact Match
      [rule] = await pool.query(
        `SELECT priority, description, keyword FROM triage_rules 
         WHERE ? LIKE CONCAT('%', keyword, '%') 
         ORDER BY FIELD(priority, 'Emergency', 'Darurat', 'Non-Darurat') ASC LIMIT 1`,
        [symptom]
      );

      // 2. Coba Partial Match (Per Kata)
      if (rule.length === 0 && words.length > 0) {
        const conditions = words
          .map(() => "keyword LIKE CONCAT('%', ?, '%')")
          .join(" OR ");
        [rule] = await pool.query(
          `SELECT priority, description, keyword FROM triage_rules 
             WHERE (${conditions})
             ORDER BY FIELD(priority, 'Emergency', 'Darurat', 'Non-Darurat') ASC LIMIT 1`,
          words
        );
      }

      let finalPriority = rule.length ? rule[0].priority : "Non-Darurat";
      let description = rule.length
        ? rule[0].description
        : "Butuh evaluasi dokter lebih lanjut.";

      // logika penyesuaian berdasarkan input severity pasien
      const severityLower = severity.toLowerCase();
      const isRingan = severityLower.match(
        /ringan|sedikit|dikit|kecil|biasa|lumayan|kurang/
      );
      const isBerat = severityLower.match(
        /berat|parah|hebat|sakit banget|sekali|tak tertahankan|luar biasa|mati/
      );

      console.log(
        `⚖️ Base Priority: ${finalPriority} | User Severity: ${severity}`
      );

      if (finalPriority === "Emergency") {
        if (isRingan) {
          finalPriority = "Darurat"; 
          description += " (Pasien melaporkan gejala ringan).";
          // console.log("⬇️ DOWNGRADE: Emergency -> Darurat");
        }
      } else if (finalPriority === "Darurat") {
        if (isRingan) {
          finalPriority = "Non-Darurat";
          // console.log("⬇️ DOWNGRADE: Darurat -> Non-Darurat");
        }
      } else if (finalPriority === "Non-Darurat") {
        if (isBerat) {
          finalPriority = "Darurat";
          description = "Gejala awal ringan namun intensitas berat.";
          // console.log("⬆️ UPGRADE: Non-Darurat -> Darurat");
        }
      }

      // console.log(`🏁 KEPUTUSAN FINAL: ${finalPriority}`);

      // ==============================================================================
      // 🛡️ LOGIKA SAFETY (KHUSUS SKRIPSI NON-EMERGENCY)
      // ==============================================================================
      let finalResponseText = "";
      if (finalPriority === "Emergency") {
        description =
          "⚠️ PERINGATAN: Indikasi GAWAT DARURAT. Tidak dapat dilayani telekonsultasi.";

        finalResponseText = `
🚨 **PERINGATAN KEAMANAN** 🚨

Sistem mendeteksi indikasi: ${finalPriority}
Keluhan: ${symptom} (${severity})

**Mohon Maaf, Layanan Telekonsultasi Tidak Dapat Dilanjutkan.**
Demi keselamatan nyawa, mohon JANGAN menggunakan website ini. Segera datang ke IGD Rumah Sakit terdekat.
        `.replace(/^\s+/gm, "");
      }
      else {
        finalResponseText = `
• Keluhan     : ${symptom}
• Keparahan   : ${severity}
• Durasi      : ${duration}
• Prioritas   : ${finalPriority}

${description}
Silakan lanjutkan untuk konsultasi dengan dokter.
        `.replace(/^\s+/gm, "");
      }
      await pool.query(
        `INSERT INTO triage_result (patient_id, symptom, severity, duration, priority, description, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [patientId, symptom, severity, duration, finalPriority, description, "pending"]
      );

      const outputContexts = [
        { name: `${session}/contexts/triage-data`, lifespanCount: 0 },
      ];

      return res
        .status(200)
        .json({ fulfillmentText: finalResponseText, outputContexts });
    } else {
      return res.status(200).json({ fulfillmentText: "Maaf, bisa diulangi?" });
    }
  } catch (error) {
    console.error("Error in triageWebhook:", error);
    return res
      .status(500)
      .json({ fulfillmentText: "Terjadi kesalahan server." });
  }
};
