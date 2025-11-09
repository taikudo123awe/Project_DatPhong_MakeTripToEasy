const express = require("express");
const router = express.Router();
const customerController = require("../controllers/customerController");
const { ensureCustomerLoggedIn } = require("../middlewares/authMiddleware");
const reviewController = require("../controllers/reviewController");
const validateUpdateProfile = require('../middlewares/validateUpdateProfile');
const bookingController = require("../controllers/bookingController");

//Gửi đánh giá
router.post("/review/:bookingId", reviewController.submitReview);
// Bước 1: Xem lịch sử phòng đã đặt
router.get(
  "/history",
  ensureCustomerLoggedIn,
  customerController.showBookingsByStatus
);

// SỬA LẠI LOGIC THANH TOÁN
router.post('/payment', ensureCustomerLoggedIn, customerController.createPaymentUrl); // Đổi tên hàm
router.get('/vnpay_return', ensureCustomerLoggedIn, customerController.vnpayReturn); // Route khách quay về
// router.get('/vnpay_ipn', customerController.vnpayIpn); // Route VNPay gọi (IPN)

// Hiển thị form chỉnh sửa
router.get('/update',ensureCustomerLoggedIn ,customerController.showEditProfile);
router.post('/update', ensureCustomerLoggedIn,  validateUpdateProfile, customerController.updateProfile);

router.get(
  "/booking/:bookingId",
  ensureCustomerLoggedIn,
  customerController.showCustomerBookingDetail
);

router.get('/history-dashboard', ensureCustomerLoggedIn,customerController.viewBookingHistory);
router.get('/history-detail/:id', ensureCustomerLoggedIn,customerController.viewBookingDetail);
// Hủy phòng
router.post('/cancel-booking', ensureCustomerLoggedIn, bookingController.cancelBookingByCustomer);

module.exports = router;