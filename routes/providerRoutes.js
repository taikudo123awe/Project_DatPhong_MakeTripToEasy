const express = require('express');
const router = express.Router();
const { ensureProviderLoggedIn } = require('../middlewares/authMiddleware');
const roomController = require('../controllers/roomController');
const Room = require('../models/Room');
const providerController = require('../controllers/providerController');
const validateProvider = require('../middlewares/validateProvider');
// -----------------
console.log('validateProvider type:', typeof validateProvider);
console.log('providerController.registerProvider type:', typeof providerController.registerProvider);

// -------------------------Quản lý phòng của nhà cung cấp-----------------------
// Hiển thị form
router.get('/add-room', ensureProviderLoggedIn, roomController.showAddRoomForm);

// Xử lý form
router.post('/add-room', ensureProviderLoggedIn, roomController.createRoom);

router.get('/dashboard', ensureProviderLoggedIn, async (req, res) => {
    try {
      const providerId = req.session.provider.providerId;
      console.log('>> providerId:', providerId);  // <== kiểm tra ID
  
      const providerRooms = await Room.findAll({
        where: { providerId },
        order: [['postedAt', 'DESC']]
      });
  
      console.log('>> Số phòng tìm được:', providerRooms.length);  // <== debug data
  
      res.render('provider/dashboard', {
        provider: req.session.provider,
        providerRooms
      });
    } catch (err) {
      console.error('❌ Lỗi khi lấy danh sách phòng:', err);
      res.status(500).send('Lỗi khi tải phòng');
    }
  });
// -------------------------Đăng ký-----------------------

// Hiển thị form đăng ký
router.get('/register', (req, res) => {
  res.render('provider/register', { error: null, success: null });
});

// Xử lý đăng ký (kèm middleware kiểm tra)
router.post('/register', validateProvider, providerController.registerProvider);


module.exports = router;
