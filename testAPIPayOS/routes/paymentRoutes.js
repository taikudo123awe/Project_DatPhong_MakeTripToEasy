const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");

// API tạo mã thanh toán
router.post("/create", paymentController.createPayment);

// Webhook PayOS sẽ gửi về khi thanh toán xong
router.post("/webhook", express.json(), paymentController.handleWebhook);

module.exports = router;
