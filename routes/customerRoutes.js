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

// Bước 3, 5: Gửi yêu cầu thanh toán
router.post(
  "/payment",
  ensureCustomerLoggedIn,
  customerController.showPaymentPage
);

// Bước 7, 8: Xác nhận đã chuyển tiền
router.post(
  "/confirm-payment",
  ensureCustomerLoggedIn,
  customerController.confirmPayment
);

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