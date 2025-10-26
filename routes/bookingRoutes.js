const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");
const { ensureCustomerLoggedIn } = require("../middlewares/authMiddleware");
//root
// Hiển thị form đặt phòng
router.get("/:roomId", ensureCustomerLoggedIn, bookingController.showBookingForm);

// Xử lý khi đặt phòng
router.post("/:roomId", ensureCustomerLoggedIn, bookingController.handleBooking);

// Danh sách đặt phòng
router.get("/", ensureCustomerLoggedIn, bookingController.listCustomerBookings);

module.exports = router;
