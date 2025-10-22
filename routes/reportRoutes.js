// routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Hiển thị báo cáo
router.get('/', reportController.viewReport);

module.exports = router; // ✅ BẮT BUỘC phải có dòng này
