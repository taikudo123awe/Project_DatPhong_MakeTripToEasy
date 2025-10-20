const Provider = require("../models/Provider");
const Room = require("../models/Room");
const PaymentInfo = require("../models/PaymentInfo");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const Account = require("../models/Account");

// ==================== DASHBOARD ====================

exports.showDashboard = async (req, res) => {
  try {
    const providerId = req.session.provider.id; // ✅ Giữ theo MAIN
    console.log(">> providerId:", providerId);

    const providerRooms = await Room.findAll({
      where: { providerId },
      order: [["postedAt", "DESC"]],
    });

    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    res.render("provider/dashboard", {
      provider: req.session.provider,
      providerRooms,
      success,
      error,
    });
  } catch (err) {
    console.error("❌ Lỗi dashboard:", err);
    res.status(500).send("Không thể tải trang dashboard.");
  }
};

// ==================== EDIT PROFILE ====================

// Hiển thị form với thông tin có sẵn
exports.showEditProfileForm = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    const provider = await Provider.findByPk(providerId);

    const paymentInfo = await PaymentInfo.findOne({
      where: { providerId },
    });

    if (!provider) {
      return res.status(404).send("Không tìm thấy nhà cung cấp.");
    }

    res.render("provider/edit-profile", {
      provider,
      paymentInfo,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải form chỉnh sửa:", err);
    res.status(500).send("Lỗi khi tải form chỉnh sửa hồ sơ");
  }
};

// Cập nhật hồ sơ + ảnh QR
exports.updateProfile = async (req, res) => {
  try {
    const providerId = req.session.provider.id;

    const {
      providerName,
      email,
      phoneNumber,
      taxCode,
      bankName,
      accountHolder,
      accountNumber,
    } = req.body;

    await Provider.update(
      {
        providerName,
        email,
        phoneNumber,
        taxCode,
      },
      {
        where: { providerId },
      }
    );

    const existingPaymentInfo = await PaymentInfo.findOne({
      where: { providerId },
    });

    const paymentData = {
      bankName,
      accountHolder,
      accountNumber,
      providerId,
    };

    if (req.file) {
      paymentData.qrCode = req.file.path
        .replace("public\\", "")
        .replace("public/", "");
    } else if (existingPaymentInfo) {
      paymentData.qrCode = existingPaymentInfo.qrCode;
    }

    if (existingPaymentInfo) {
      await PaymentInfo.update(paymentData, {
        where: { paymentInfoId: existingPaymentInfo.paymentInfoId },
      });
    } else if (
      bankName ||
      accountHolder ||
      accountNumber ||
      paymentData.qrCode
    ) {
      await PaymentInfo.create(paymentData);
    }

    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật thông tin:", err);
    res.status(500).send("Lỗi khi cập nhật thông tin");
  }
};

// ==================== REGISTER PROVIDER ====================

exports.registerProvider = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const {
      providerName,
      email,
      phoneNumber,
      identityNumber,
      taxCode,
      password,
      confirmPassword,
    } = req.body;

    if (password !== confirmPassword) {
      return res.render("provider/register", {
        error: "Mật khẩu nhập lại không khớp!",
        success: null,
        formData: req.body,
      });
    }

    const existing = await Account.findOne({
      where: { username: phoneNumber },
    });
    if (existing) {
      return res.render("provider/register", {
        error: "Số điện thoại đã được sử dụng!",
        success: null,
        formData: req.body,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await Account.create(
      {
        username: phoneNumber,
        password: hashedPassword,
        role: 1,
      },
      { transaction: t }
    );

    await Provider.create(
      {
        providerName,
        email,
        phoneNumber,
        identityNumber,
        taxCode,
        accountId: account.accountId,
      },
      { transaction: t }
    );

    await t.commit();

    return res.redirect("/provider/login");
  } catch (error) {
    await t.rollback();
    return res.render("provider/register", {
      error: "Đăng ký thất bại: " + error.message,
      success: null,
      formData: req.body,
    });
  }
};
