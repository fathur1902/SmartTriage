const express = require("express");
const router = express.Router();
const dokterController = require("../controllers/dokterController");

router.get("/dashboard", dokterController.getDashboardStats);
router.get("/pasien-masuk", dokterController.getIncomingPatients);
router.get("/riwayat-pasien", dokterController.getPatientHistory);
router.get("/konsultasi", dokterController.startConsultation);
router.post("/konsultasi", dokterController.sendMessageAndSaveDiagnosis);
router.get("/profile", dokterController.getProfile);
router.put("/profile", dokterController.updateProfile);
router.put("/triage-complete/:triageId", dokterController.markTriageComplete);

module.exports = router;
