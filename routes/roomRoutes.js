const express = require("express");
const router = express.Router();
const roomController = require('../controllers/roomController');
const validateSearch = require('../middlewares/validateSearch');

// Tìm kiếm phòng
router.get('/search', validateSearch, roomController.searchRooms);
// Danh sách tất cả phòng đã duyệt
router.get("/", roomController.getAllRooms);
// Chi tiết phòng
router.get("/:roomId", roomController.getRoomDetail);

module.exports = router;
