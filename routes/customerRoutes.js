const express = require('express');
const router = express.Router();
const {ensureCustomerLoggedIn } = require('../middlewares/authMiddleware');
const customerController = require('../controllers/customerController');

// Hiển thị form chỉnh sửa
router.get('/update', ensureCustomerLoggedIn, customerController.showEditProfile);
router.post('/update', ensureCustomerLoggedIn, customerController.updateProfile);


// 🆕 Xem lịch sử đặt phòng
router.get('/history', ensureCustomerLoggedIn, customerController.viewBookingHistory);

// 🆕 Xem chi tiết 1 booking
router.get('/history/:id', ensureCustomerLoggedIn, customerController.viewBookingDetail);


module.exports = router;
