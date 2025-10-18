const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

// Trang chủ + hiện lỗi (nếu có) + giữ lại dữ liệu form
router.get('/', (req, res) => {
  res.render('home', {
    error: req.query.error,
    form: {
      address: req.query.address || '',
      checkIn: req.query.checkIn || '',
      checkOut: req.query.checkOut || '',
      guests: req.query.guests || '1',
      rooms: req.query.rooms || '1'
    }
  });
});

// Tìm kiếm
router.get('/search', roomController.searchRooms);

module.exports = router;
