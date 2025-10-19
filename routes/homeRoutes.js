const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getRoomsForHome);
router.get('/search', roomController.searchRooms);

module.exports = router;
