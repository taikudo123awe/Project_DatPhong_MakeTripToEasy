const express = require("express");
const router = express.Router();
const { ensureProviderLoggedIn } = require("../middlewares/authMiddleware");
const roomController = require("../controllers/roomController");
const providerController = require("../controllers/providerController");
const validateProvider = require("../middlewares/validateProvider");
const reviewController = require("../controllers/reviewController");
const bookingController = require("../controllers/bookingController"); //Quan ly dat phong
const {
  validateAddRoom,
  validateEditRoom,
} = require("../middlewares/validateRoom");
// --- THÊM CẤU HÌNH MULTER ---
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ================== TẠO THƯ MỤC NẾU CHƯA TỒN TẠI ==================
const imgroomsPath = path.join(
  __dirname,
  "..",
  "public",
  "uploads",
  "imgrooms"
);
const qrcodesPath = path.join(__dirname, "..", "public", "uploads", "qrcodes");

if (!fs.existsSync(imgroomsPath))
  fs.mkdirSync(imgroomsPath, { recursive: true });
if (!fs.existsSync(qrcodesPath)) fs.mkdirSync(qrcodesPath, { recursive: true });

// ================== CẤU HÌNH MULTER ==================

// Upload ảnh phòng
const storageRoom = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/uploads/imgrooms/"),
  filename: (req, file, cb) => {
    const id = req.session.provider?.id || "unknown";
    cb(null, `${id}-room-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const uploadRoom = multer({ storage: storageRoom });

// Upload QR code
const storageQR = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./public/uploads/qrcodes/"),
  filename: (req, file, cb) => {
    const id = req.session.provider?.id || "unknown";
    cb(null, `${id}-qr-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const uploadQR = multer({ storage: storageQR });

// ================== ROUTES ==================

// Dashboard
router.get(
  "/dashboard",
  ensureProviderLoggedIn,
  providerController.showDashboard
);

// Thêm phòng
router.get("/add-room", ensureProviderLoggedIn, roomController.showAddRoomForm);
router.post(
  "/add-room",
  ensureProviderLoggedIn,
  uploadRoom.array("images", 10),
  validateAddRoom, // ✅ THÊM DÒNG NÀY
  roomController.createRoom
);

// Sửa phòng
router.get(
  "/edit-room/:roomId",
  ensureProviderLoggedIn,
  roomController.showEditRoomForm
);
router.post(
  "/edit-room/:roomId",
  ensureProviderLoggedIn,
  uploadRoom.array("images", 10),
  validateEditRoom, // ✅ THÊM DÒNG NÀY
  roomController.updateRoom
);

// Xoá phòng
router.post(
  "/delete-room/:roomId",
  ensureProviderLoggedIn,
  roomController.deleteRoom
);

// Hồ sơ nhà cung cấp
router.get(
  "/edit-profile",
  ensureProviderLoggedIn,
  providerController.showEditProfileForm
);
router.post(
  "/edit-profile",
  ensureProviderLoggedIn,
  uploadQR.single("qrCodeImage"),
  providerController.updateProfile
);

// Đánh giá & phản hồi
router.get(
  "/reviews",
  ensureProviderLoggedIn,
  reviewController.showReviewedRooms
);
router.get(
  "/reviews/:roomId",
  ensureProviderLoggedIn,
  reviewController.showRoomReviews
);
router.post(
  "/reviews/feedback",
  ensureProviderLoggedIn,
  reviewController.addFeedback
);

// --- THÊM ROUTE MỚI CHO QUẢN LÝ ĐẶT PHÒNG ---
router.get(
  "/bookings",
  ensureProviderLoggedIn,
  bookingController.listAllBookings
);
router.get(
  "/bookings/:bookingId",
  ensureProviderLoggedIn,
  bookingController.showBookingDetails
);
router.post(
  "/bookings/confirm",
  ensureProviderLoggedIn,
  bookingController.confirmCheckIn
);
router.post(
  "/bookings/cancel",
  ensureProviderLoggedIn,
  bookingController.cancelBooking
);

// Hiển thị form đăng ký
router.get("/register", (req, res) => {
  res.render("provider/register", { error: null, success: null, formData: {} });
});

// Xử lý đăng ký (kèm middleware kiểm tra)
router.post("/register", validateProvider, providerController.registerProvider);

module.exports = router;
