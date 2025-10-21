const express = require("express");
const router = express.Router();
const { ensureProviderLoggedIn } = require("../middlewares/authMiddleware");
const roomController = require("../controllers/roomController");
const providerController = require("../controllers/providerController");

const multer = require("multer");
const path = require("path");

// --- Storage cho ảnh phòng ---
const storageRoom = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/rooms/");
  },
  filename: (req, file, cb) => {
    const providerId = req.session.provider?.id || "unknown";
    const uniqueName = `${providerId}-room-${Date.now()}${path.extname(
      file.originalname
    )}`;
    cb(null, uniqueName);
  },
});

const uploadRoom = multer({
  storage: storageRoom,
  // (tuỳ chọn) chặn file sai loại ngay từ đây
  fileFilter: (req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/jpg"].includes(file.mimetype);
    cb(ok ? null : new Error("Định dạng ảnh không hợp lệ"), ok);
  },
});

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
router.get("/:id", roomController.getRoomDetail);
module.exports = router;
