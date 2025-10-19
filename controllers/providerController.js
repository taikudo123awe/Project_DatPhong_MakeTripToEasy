const Provider = require("../models/Provider");
const Room = require("../models/Room");

// Hiển thị dashboard của provider
exports.showDashboard = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const providerRooms = await Room.findAll({
      where: { providerId },
      order: [["postedAt", "DESC"]],
    });

    res.render("provider/dashboard", {
      provider: req.session.provider,
      providerRooms,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải dashboard:", err);
    res.status(500).send("Lỗi khi tải dashboard");
  }
};

// Hiển thị form chỉnh sửa hồ sơ
exports.showEditProfileForm = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const provider = await Provider.findByPk(providerId);
    res.render("provider/edit-profile", { provider });
  } catch (err) {
    console.error("❌ Lỗi khi tải form chỉnh sửa:", err);
    res.status(500).send("Lỗi khi tải form chỉnh sửa hồ sơ");
  }
};

// Cập nhật hồ sơ + ảnh QR
exports.updateProfile = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const { providerName, email, phoneNumber, taxCode } = req.body;

    const updateData = { providerName, email, phoneNumber, taxCode };

    // Nếu có file QR code upload
    if (req.file) {
      updateData.qrCode = req.file.path
        .replace("public\\", "")
        .replace("public/", "");
    }

    await Provider.update(updateData, { where: { providerId } });
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật hồ sơ:", err);
    res.status(500).send("Lỗi khi cập nhật hồ sơ");
  }
};
