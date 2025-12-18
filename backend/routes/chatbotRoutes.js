const express = require("express");
const router = express.Router();
const chatbotController = require("../controllers/chatbotController");

router.post("/triage", chatbotController.triageWebhook);
router.post("/ask", chatbotController.askChatbot);

module.exports = router;
