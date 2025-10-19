const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

//Lấy danh sách phòng
router.get('/', roomController.getAllRooms);

// Form thêm phòng (cho provider)
router.get('/add', roomController.showAddRoomForm);

// Xử lý thêm phòng
router.post('/add', roomController.createRoom);

// Trang chi tiết phòng
router.get('/:id', roomController.getRoomDetail);

module.exports = router;
