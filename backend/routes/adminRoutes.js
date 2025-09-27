const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

router.get("/profile", adminController.getProfile);
router.put("/profile", adminController.updateProfile);
router.post("/doctors", adminController.createDoctor);
router.get("/doctors", adminController.getDoctors);
router.put("/doctors/:id/toggle", adminController.toggleDoctorStatus);
router.get("/patients", adminController.getPatients);
router.put("/patients/:id/toggle", adminController.togglePatientStatus);
router.get("/dashboard", adminController.getDashboardStats);

module.exports = router;
