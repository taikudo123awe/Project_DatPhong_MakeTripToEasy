const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { ensureCustomerLoggedIn } = require('../middlewares/authMiddleware');

// Bước 1: Xem lịch sử phòng đã đặt
router.get('/history', ensureCustomerLoggedIn, customerController.showBookingHistory);

// Bước 3, 5: Gửi yêu cầu thanh toán
router.post('/payment', ensureCustomerLoggedIn, customerController.showPaymentPage);

// Bước 7, 8: Xác nhận đã chuyển tiền
router.post('/confirm-payment', ensureCustomerLoggedIn, customerController.confirmPayment);

module.exports = router;