const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/checkAdmin');

router.get('/rooms', isAdmin, adminController.getAllRooms);
router.get('/rooms/:id', isAdmin, adminController.getRoomDetail);
router.post('/rooms/:id/approve', isAdmin, adminController.approveRoom);
router.post('/rooms/:id/reject', isAdmin, adminController.rejectRoom);

module.exports = router;
