const express = require("express");
const router = express.Router();

const { ensureProviderLoggedIn } = require("../middlewares/authMiddleware");
const roomController = require("../controllers/roomController");
const providerController = require("../controllers/providerController");
const validateProvider = require("../middlewares/validateProvider");
const reviewController = require("../controllers/reviewController"); // ✅ giữ từ main
const Room = require("../models/Room");
const multer = require("multer");
const path = require("path");

// =================== UPLOAD QR CODE ===================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/qrcodes/");
  },
  filename: function (req, file, cb) {
    const providerId = req.session.provider?.id || "unknown";
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `${providerId}-qr-${uniqueSuffix}`);
  },
});
const upload = multer({ storage });

// =================== UPLOAD ẢNH PHÒNG ===================
const storageRoom = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/imgrooms/");
  },
  filename: (req, file, cb) => {
    const providerId = req.session.provider?.id || "unknown";
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, `${providerId}-room-${uniqueSuffix}`);
  },
});
const uploadRoom = multer({ storage: storageRoom });

// ======================= ROUTES =======================

// ✅ Thêm phòng
router.get("/add-room", ensureProviderLoggedIn, roomController.showAddRoomForm);
router.post(
  "/add-room",
  ensureProviderLoggedIn,
  uploadRoom.array("images", 10), // ✅ chỉ "images"
  roomController.createRoom
);

// ✅ Dashboard
router.get(
  "/dashboard",
  ensureProviderLoggedIn,
  providerController.showDashboard
);

// ✅ Chỉnh sửa hồ sơ
router.get(
  "/edit-profile",
  ensureProviderLoggedIn,
  providerController.showEditProfileForm
);
router.post(
  "/edit-profile",
  ensureProviderLoggedIn,
  upload.single("qrCodeImage"),
  providerController.updateProfile
);

// ✅ Sửa phòng
router.get(
  "/edit-room/:roomId",
  ensureProviderLoggedIn,
  roomController.showEditRoomForm
);
router.post(
  "/edit-room/:roomId",
  ensureProviderLoggedIn,
  uploadRoom.array("images", 5),
  roomController.updateRoom
);

// ✅ Xóa phòng
router.post(
  "/delete-room/:roomId",
  ensureProviderLoggedIn,
  roomController.deleteRoom
);

// ✅ Trang đánh giá (Review)
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

// ✅ Đăng ký Provider
router.get("/register", (req, res) => {
  res.render("provider/register", { error: null, success: null, formData: {} });
});
router.post("/register", validateProvider, providerController.registerProvider);

module.exports = router;
