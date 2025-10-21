const express = require('express');
const router = express.Router();
const { ensureProviderLoggedIn } = require('../middlewares/authMiddleware');
const roomController = require('../controllers/roomController');
const providerController = require('../controllers/providerController');
const validateProvider = require('../middlewares/validateProvider');
const Room = require('../models/Room');
const reviewController = require('../controllers/reviewController');
const bookingController = require('../controllers/bookingController'); //Quan ly dat phong
// --- THÊM CẤU HÌNH MULTER ---
const multer = require('multer');
const path = require('path');

// Cấu hình nơi lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/uploads/qrcodes/');
  },
  filename: function (req, file, cb) {
    // Tạo tên file duy nhất: providerId-qr-timestamp.ext
    const providerId = req.session.provider.id;
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, providerId + '-qr-' + uniqueSuffix);
  }
});

// Khởi tạo middleware upload
const upload = multer({ storage: storage });
// Hiển thị form
router.get('/add-room', ensureProviderLoggedIn, roomController.showAddRoomForm);

// Xử lý form
router.post('/add-room', ensureProviderLoggedIn, roomController.createRoom);

// Cập nhật route dashboard để dùng controller
router.get('/dashboard', ensureProviderLoggedIn, providerController.showDashboard);

// GET: Hiển thị form
router.get('/edit-profile', ensureProviderLoggedIn, providerController.showEditProfileForm);

// POST: Xử lý cập nhật
router.post('/edit-profile',
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

// --- THÊM ROUTE MỚI CHO QUẢN LÝ ĐẶT PHÒNG ---
router.get('/bookings', ensureProviderLoggedIn, bookingController.listAllBookings);
router.get('/bookings/:bookingId', ensureProviderLoggedIn, bookingController.showBookingDetails);
router.post('/bookings/confirm', ensureProviderLoggedIn, bookingController.confirmCheckIn);
router.post('/bookings/cancel', ensureProviderLoggedIn, bookingController.cancelBooking);
// --- KẾT THÚC THÊM ---

// Hiển thị form đăng ký
router.get('/register', (req, res) => {
  res.render('provider/register', { error: null, success: null, formData: {} });
});

// Xử lý đăng ký (kèm middleware kiểm tra)
router.post('/register', validateProvider, providerController.registerProvider);

module.exports = router;
