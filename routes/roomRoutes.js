const express = require("express");
const router = express.Router();
const { ensureProviderLoggedIn } = require("../middlewares/authMiddleware");
const roomController = require("../controllers/roomController");
const providerController = require("../controllers/providerController");

const multer = require("multer");
const path = require("path");

// --- Cấu hình upload ảnh phòng ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/rooms/");
  },
  filename: (req, file, cb) => {
    const providerId = req.session.provider.providerId;
    const uniqueName = `${providerId}-room-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });
// ---------------------------------

router.get("/add-room", ensureProviderLoggedIn, roomController.showAddRoomForm);
router.post(
  "/add-room",
  ensureProviderLoggedIn,
  upload.single("image"),
  roomController.createRoom
);

router.get(
  "/dashboard",
  ensureProviderLoggedIn,
  providerController.showDashboard
);
router.get(
  "/edit-profile",
  ensureProviderLoggedIn,
  providerController.showEditProfileForm
);

module.exports = router;
