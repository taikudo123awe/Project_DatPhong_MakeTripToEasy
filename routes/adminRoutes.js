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


// --- THÊM ROUTE QUẢN LÝ TÀI KHOẢN ---
router.get('/users', isAdmin, adminController.listUsers);
router.get('/users/:accountId', isAdmin, adminController.showUserDetails);
router.post('/users/:accountId/lock', isAdmin, adminController.lockUser);
router.post('/users/:accountId/unlock', isAdmin, adminController.unlockUser);
router.post('/users/:accountId/delete', isAdmin, adminController.deleteUser);
// --- KẾT THÚC THÊM ---

module.exports = router;
