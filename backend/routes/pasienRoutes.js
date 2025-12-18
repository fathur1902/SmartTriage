const express = require("express");
const router = express.Router();
const pasienController = require("../controllers/pasienController");

router.get("/profile", pasienController.getProfile);
router.put("/profile", pasienController.updateProfile);
router.get("/dashboard", pasienController.getDashboard);
router.get("/history", pasienController.getConsultationHistory);
router.post("/consultation", pasienController.sendConsultationMessage);
router.get("/doctors", pasienController.getDoctorsList);

module.exports = router;
