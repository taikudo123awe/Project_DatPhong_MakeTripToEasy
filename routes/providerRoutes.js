const express = require("express");
const router = express.Router();
const { ensureProviderLoggedIn } = require("../middlewares/authMiddleware");
const roomController = require("../controllers/roomController");
const providerController = require("../controllers/providerController");
const Room = require("../models/Room");

const multer = require("multer");
const path = require("path");

// --- Cấu hình upload QR code (cho phần hồ sơ nhà cung cấp) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/uploads/qrcodes/");
  },
  filename: function (req, file, cb) {
    const providerId = req.session.provider.providerId;
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, providerId + "-qr-" + uniqueSuffix);
  },
});
const upload = multer({ storage: storage });

// --- Cấu hình upload ảnh phòng ---
const storageRoom = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/imgrooms/");
  },
  filename: (req, file, cb) => {
    const providerId = req.session.provider.providerId || "unknown";
    cb(
      null,
      `${providerId}-room-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});
const uploadRoom = multer({ storage: storageRoom });

// -------------------- ROUTES --------------------

// Hiển thị form thêm phòng
router.get("/add-room", ensureProviderLoggedIn, roomController.showAddRoomForm);

// Xử lý thêm phòng
router.post(
  "/add-room",
  ensureProviderLoggedIn,
  uploadRoom.single("image"),
  roomController.createRoom
);

// Dashboard của provider
router.get(
  "/dashboard",
  ensureProviderLoggedIn,
  providerController.showDashboard
);

// Hiển thị form chỉnh sửa hồ sơ
router.get(
  "/edit-profile",
  ensureProviderLoggedIn,
  providerController.showEditProfileForm
);

// Cập nhật hồ sơ + upload QR
router.post(
  "/edit-profile",
  ensureProviderLoggedIn,
  upload.single("qrCodeImage"),
  providerController.updateProfile
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
  uploadRoom.array("images", 5),
  roomController.updateRoom
);

// Xóa phòng
router.post(
  "/delete-room/:roomId",
  ensureProviderLoggedIn,
  roomController.deleteRoom
);

module.exports = router;
