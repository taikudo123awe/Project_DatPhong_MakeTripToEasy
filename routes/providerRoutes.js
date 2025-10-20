const express = require('express');
const router = express.Router();
const { ensureProviderLoggedIn } = require('../middlewares/authMiddleware');
const roomController = require('../controllers/roomController');
const providerController = require('../controllers/providerController');
const Room = require('../models/Room');
const reviewController = require('../controllers/reviewController');
// --- THÊM CẤU HÌNH MULTER ---
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Lưu file vào thư mục public/uploads/qrcodes
    // Bạn cần tạo thư mục 'uploads/qrcodes' bên trong thư mục 'public'
    cb(null, './public/uploads/qrcodes/');
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: providerId-qr-timestamp.ext
    const providerId = req.session.provider.providerId;
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, providerId + '-qr-' + uniqueSuffix);
  }
});

// Khởi tạo middleware upload
const upload = multer({ storage: storage });
// --- KẾT THÚC CẤU HÌNH MULTER ---


// Hiển thị form
router.get('/add-room', ensureProviderLoggedIn, roomController.showAddRoomForm);

// Xử lý form
router.post('/add-room', ensureProviderLoggedIn, roomController.createRoom);

// Cập nhật route dashboard để dùng controller
router.get('/dashboard', ensureProviderLoggedIn, providerController.showDashboard);

// --- THÊM ROUTE MỚI CHO EDIT PROFILE ---
// GET: Hiển thị form
router.get('/edit-profile', ensureProviderLoggedIn, providerController.showEditProfileForm);

// POST: Xử lý cập nhật
// *** ÁP DỤNG MIDDLEWARE UPLOAD VÀO ĐÂY ***
// 'qrCodeImage' là tên của trường <input type="file"> trong form
router.post(
  '/edit-profile', 
  ensureProviderLoggedIn, 
  upload.single('qrCodeImage'), // Thêm middleware
  providerController.updateProfile
);
// --- KẾT THÚC THÊM ---
// --- THÊM ROUTE MỚI CHO CHỨC NĂNG ĐÁNH GIÁ ---

router.get('/reviews', ensureProviderLoggedIn, reviewController.showReviewedRooms);
router.get('/reviews/:roomId', ensureProviderLoggedIn, reviewController.showRoomReviews);
router.post('/reviews/feedback', ensureProviderLoggedIn, reviewController.addFeedback);

// --- KẾT THÚC THÊM ---
module.exports = router;