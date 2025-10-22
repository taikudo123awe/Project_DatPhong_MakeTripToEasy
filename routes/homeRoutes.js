const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/", roomController.getRoomsForHome);
router.get("/rooms", roomController.getAllRooms);
router.get("/", (req, res) => {
  res.render("home");
});

module.exports = router;
