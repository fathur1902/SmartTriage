const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/dokter/logout", authController.logoutDokter);
router.put("/reset-password", authController.resetPassword);
module.exports = router;
