const express = require("express");
const router = express.Router();
const { ensureProviderLoggedIn } = require("../middlewares/authMiddleware");
const roomController = require("../controllers/roomController");
const providerController = require("../controllers/providerController");
const validateProvider = require("../middlewares/validateProvider");
const reviewController = require("../controllers/reviewController");
const bookingController = require("../controllers/bookingController"); //Quan ly dat phong
const validateSetupProfile = require("../middlewares/validateSetupProfile");
const validateEditProviderInfo = require("../middlewares/validateEditProviderInfo");

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

// ⚙️ Cấu hình lưu ảnh logo
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/"); // thư mục lưu ảnh
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// ✅ Tạo biến upload dùng cho route
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Chỉ chấp nhận file JPG/PNG"));
  },
});

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
  "/add-room", // ✅ chỉ cần /add-room thôi
  ensureProviderLoggedIn, // 👈 thêm middleware để chặn truy cập trái phép
  uploadRoom.array("images", 10),
  validateAddRoom,
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
  uploadRoom.array("images", 10),
  validateEditRoom,
  roomController.updateRoom
);
// Xoá phòng
router.post(
  "/delete-room/:roomId",
  ensureProviderLoggedIn,
  roomController.deleteRoom
);
// chỉnh sửa nhà cung cấp
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

// Route GET setup-profile
router.get(
  "/setup-profile",
  ensureProviderLoggedIn,
  providerController.showSetupProfile
);

// Route POST setup-profile (phải đặt sau upload)
router.post(
  "/setup-profile",
  ensureProviderLoggedIn,
  upload.single("logoImage"),
  validateSetupProfile,
  providerController.saveSetupProfile
);

// Xem hồ sơ doanh nghiệp
router.get(
  "/profile",
  ensureProviderLoggedIn,
  providerController.viewProviderInfo
);

router.get(
  "/profile/edit-info",
  ensureProviderLoggedIn,
  providerController.showEditProviderInfo
);
router.post(
  "/profile/edit-info",
  ensureProviderLoggedIn,
  upload.single("logoImage"),
  validateEditProviderInfo, // ✔️ dùng middleware gộp
  providerController.updateProviderInfo
);

// Hiển thị form đăng ký
router.get("/register", (req, res) => {
  res.render("provider/register", { error: null, success: null, formData: {} });
});

// Xử lý đăng ký (kèm middleware kiểm tra)
router.post("/register", validateProvider, providerController.registerProvider);

module.exports = router;
