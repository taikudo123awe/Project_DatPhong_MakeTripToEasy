const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/checkAdmin');
//Các chức năng quản lí phòng
router.get('/rooms', isAdmin, adminController.getAllRooms);
router.get('/rooms/:id', isAdmin, adminController.getRoomDetail);
router.post('/rooms/:id/approve', isAdmin, adminController.approveRoom);
router.post('/rooms/:id/reject', isAdmin, adminController.rejectRoom);
router.get('/dashboard', isAdmin, adminController.getDashboard);
router.post('/rooms/:id/delete', isAdmin, adminController.deleteRoom);

module.exports = router;
