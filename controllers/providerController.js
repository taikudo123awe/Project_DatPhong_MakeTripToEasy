const Provider = require("../models/Provider");
const Room = require("../models/Room");
const PaymentInfo = require("../models/PaymentInfo");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const sequelize = require("../config/database");
const Account = require("../models/Account");
const ProviderInfo = require("../models/ProviderInfo");
const Address = require("../models/Address");
const Amenity = require("../models/Amenity");
// ==================== DASHBOARD ====================
exports.showDashboard = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    console.log(">> providerId:", providerId);

    const providerRooms = await Room.findAll({
      where: { providerId, status: "Hoạt động" },
      order: [["postedAt", "DESC"]],
    });
    const providerDetail = await Provider.findByPk(providerId, {
      include: [
        {
          model: ProviderInfo,
          as: "ProviderInfo",
        },
      ],
    });
    const success = req.session.success;
    const error = req.session.error;
    delete req.session.success;
    delete req.session.error;

    res.render("provider/dashboard", {
      provider: providerDetail,
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

    // Tìm thông tin thanh toán ĐẦU TIÊN
    const paymentInfo = await PaymentInfo.findOne({
      where: { providerId },
    });

    if (!provider) {
      return res.status(404).send("Không tìm thấy nhà cung cấp.");
    }

    res.render("provider/edit-profile", {
      provider,
      paymentInfo, // Gửi paymentInfo (có thể là null)
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy thông tin provider:", err);
    res.status(500).send("Lỗi khi tải trang chỉnh sửa");
  }
};

// ==================== CẬP NHẬT HỒ SƠ ====================
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

    const errors = [];

    // Validate dữ liệu nhập
    if (!providerName?.trim())
      errors.push("Tên nhà cung cấp không được bỏ trống.");
    if (!email || !validator.isEmail(email))
      errors.push("Email không hợp lệ hoặc bị bỏ trống.");
    if (!phoneNumber) {
      errors.push("Số điện thoại không được bỏ trống.");
    } else if (!validator.isNumeric(phoneNumber) || phoneNumber.length !== 10) {
      errors.push("Số điện thoại phải có đúng 10 chữ số.");
    }
    if (bankName && !bankName.trim())
      errors.push("Tên ngân hàng không được bỏ trống.");
    if (accountHolder && !accountHolder.trim())
      errors.push("Tên chủ tài khoản không được bỏ trống.");
    if (
      (bankName || accountHolder || accountNumber) &&
      (!accountNumber || !validator.isNumeric(accountNumber))
    ) {
      errors.push("Số tài khoản phải là số hợp lệ.");
    }

    // Nếu có lỗi => render lại form với dữ liệu cũ
    if (errors.length > 0) {
      const provider = await Provider.findByPk(providerId);
      const paymentInfo = await PaymentInfo.findOne({ where: { providerId } });
      return res.render("provider/edit-profile", {
        errors,
        provider,
        paymentInfo,
        userInput: req.body,
      });
    }

    // 1️⃣ Cập nhật Provider
    await Provider.update(
      { providerName, email, phoneNumber, taxCode },
      { where: { providerId } }
    );

    // 2️⃣ Cập nhật hoặc tạo mới PaymentInfo
    const existingPaymentInfo = await PaymentInfo.findOne({
      where: { providerId },
    });
    const paymentData = { bankName, accountHolder, accountNumber, providerId };

    if (req.file) {
      // Nếu upload QR mới
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
        role: 1, // 1 = Provider
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
    console.error("❌ Lỗi đăng ký provider:", error);
    return res.render("provider/register", {
      error: "Đăng ký thất bại: " + error.message,
      success: null,
      formData: req.body,
    });
  }
};
// ==================== HIỂN THỊ FORM SETUP HỒ SƠ NCC ====================
exports.showSetupProfile = async (req, res) => {
  try {
    const provider = req.session.provider;
    if (!provider) return res.redirect("/provider/login");
    const amenities = await Amenity.findAll({
      order: [
        ["category", "ASC"],
        ["amenityName", "ASC"],
      ],
    });

    // Group theo category
    const groupedAmenities = {};
    amenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      groupedAmenities[a.category].push(a);
    });

    res.render("provider/setup-profile", {
      provider,
      groupedAmenities,
      errors: {},
      formData: {},
      error: null,
      success: null,
    });
  } catch (err) {
    console.error("❌ Lỗi hiển thị setup-profile:", err);
    res.status(500).send("Lỗi server");
  }
};
// ==================== LƯU THÔNG TIN HỒ SƠ NCC ====================
exports.saveSetupProfile = async (req, res) => {
  try {
    const provider = req.session.provider;
    if (!provider) return res.redirect("/provider/login");

    console.log("🧾 BODY:", req.body);
    console.log("📸 FILE:", req.file);

    // Lấy dữ liệu form
    const {
      businessName,
      city,
      district,
      ward,
      customAddress,
      description,
      popularAmenities,
      allowSmoking,
      allowChildren,
      allowEvents,
      petPolicy,
      checkinFrom,
      checkinTo,
      checkoutFrom,
      checkoutTo,
    } = req.body;

    // ✅ Kiểm tra dữ liệu
    if (!req.body || Object.keys(req.body).length === 0)
      throw new Error("Không nhận được dữ liệu từ form");

    // ✅ Lưu địa chỉ vào bảng Address
    const address = await Address.create({
      city,
      district,
      ward,
    });

    // ✅ Gộp tiện ích (checkbox)
    const amenitiesString = Array.isArray(popularAmenities)
      ? popularAmenities.join("; ")
      : popularAmenities || "";

    // ✅ Logo (nếu có)
    let logoPath = null;
    if (req.file) {
      logoPath = req.file.path.replace(/^public[\\/]/, "");
    }

    // ✅ Gộp địa chỉ đầy đủ
    const businessAddress = `${customAddress}, ${ward}, ${district}, ${city}`;

    console.log("📍 Address:", businessAddress);
    console.log("🐶 Pet policy:", petPolicy);
    console.log("🕐 checkinFrom:", checkinFrom, " - ", checkoutTo);

    // ✅ Lưu ProviderInfo (đã có addressId & generalRules)
    await ProviderInfo.create({
      providerId: provider.id,
      businessName, // ✔️ lưu đúng tên doanh nghiệp
      addressId: address.addressId,
      businessAddress,
      description,
      popularAmenities: amenitiesString,
      allowSmoking: allowSmoking ? 1 : 0,
      allowChildren: allowChildren ? 1 : 0,
      allowEvents: allowEvents ? 1 : 0,
      petPolicy: petPolicy || "Không",
      checkinFrom: checkinFrom || "15:00",
      checkinTo: checkinTo || "18:00",
      checkoutFrom: checkoutFrom || "08:00",
      checkoutTo: checkoutTo || "11:00",
      profileImage: logoPath,
    });

    console.log("✅ Hồ sơ đã lưu thành công!");
    req.session.success = "Hồ sơ nhà cung cấp đã được lưu thành công!";
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi lưu setup-profile:", err);
    const amenities = await Amenity.findAll({
      order: [
        ["category", "ASC"],
        ["amenityName", "ASC"],
      ],
    });

    const groupedAmenities = {};
    amenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      groupedAmenities[a.category].push(a);
    });

    res.render("provider/setup-profile", {
      error: err.message,
      success: null,
      groupedAmenities,
      errors: {},
      formData: req.body,
    });
  }
};
//Hiển thị form xem thông tin doanh nghiệp
exports.viewProviderInfo = async (req, res) => {
  try {
    const providerId = req.session.provider.id;

    const providerInfo = await ProviderInfo.findOne({
      where: { providerId },
      include: [{ model: Address, as: "Address" }],
    });

    if (!providerInfo) {
      return res.redirect("/provider/setup-profile");
    }

    // Lấy thông báo nếu có
    const success = req.session.success;
    delete req.session.success;

    res.render("provider/view-provider-info", {
      providerInfo,
      success: success || null,
    });
  } catch (err) {
    console.error("❌ Lỗi viewProviderInfo:", err);
    res.status(500).send("Lỗi khi tải hồ sơ doanh nghiệp");
  }
};

//Hiển thị form chỉnh sửa doanh nghiệp
function groupAmenities(list) {
  const grouped = {};
  list.forEach((a) => {
    if (!grouped[a.category]) grouped[a.category] = [];
    grouped[a.category].push(a);
  });
  return grouped;
}
exports.showEditProviderInfo = async (req, res) => {
  try {
    const providerId = req.session.provider.id;

    const providerInfo = await ProviderInfo.findOne({
      where: { providerId },
      include: [{ model: Address, as: "Address" }],
    });

    const amenities = await Amenity.findAll({
      order: [
        ["category", "ASC"],
        ["amenityName", "ASC"],
      ],
    });

    const groupedAmenities = {};
    amenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      groupedAmenities[a.category].push(a);
    });

    res.render("provider/edit-provider-info", {
      providerInfo,
      groupedAmenities,
      errors: {},
      formData: {},
      success: null,
    });
  } catch (err) {
    console.error("❌ Lỗi showEditProviderInfo:", err);
    res.status(500).send("Không thể tải form chỉnh sửa.");
  }
};
exports.updateProviderInfo = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    const info = req.providerInfo; // dữ liệu cũ từ middleware

    if (!info) {
      return res.redirect("/provider/setup-profile");
    }

    const {
      businessName,
      city,
      district,
      ward,
      customAddress,
      description,
      popularAmenities,
      allowSmoking,
      allowChildren,
      allowEvents,
      checkinFrom,
      checkinTo,
      checkoutFrom,
      checkoutTo,
    } = req.body;

    // =====================================
    // ⚡ 1) UPDATE Address
    // =====================================
    await Address.update(
      {
        city,
        district,
        ward,
      },
      { where: { addressId: info.addressId } }
    );

    // =====================================
    // ⚡ 2) xử lý tiện ích
    // =====================================
    const amenitiesString = Array.isArray(popularAmenities)
      ? popularAmenities.join("; ")
      : popularAmenities || "";

    // =====================================
    // ⚡ 3) xử lý logo
    // =====================================

    let logoPath = info.profileImage; // giữ logo cũ

    if (req.file) {
      logoPath = req.file.path.replace(/^public[\\/]/, "");
    }

    // =====================================
    // ⚡ 4) Gộp địa chỉ đầy đủ
    // =====================================
    const businessAddress = `${customAddress}, ${ward}, ${district}, ${city}`;

    // =====================================
    // ⚡ 5) UPDATE ProviderInfo
    // =====================================
    await ProviderInfo.update(
      {
        businessName,
        businessAddress,
        description,
        popularAmenities: amenitiesString,
        allowSmoking: allowSmoking ? 1 : 0,
        allowChildren: allowChildren ? 1 : 0,
        allowEvents: allowEvents ? 1 : 0,
        checkinFrom,
        checkinTo,
        checkoutFrom,
        checkoutTo,
        profileImage: logoPath,
      },
      { where: { infoId: info.infoId } }
    );

    req.session.success = "Cập nhật hồ sơ thành công!";
    res.redirect("/provider/profile");
  } catch (err) {
    console.error("❌ Lỗi updateProviderInfo:", err);
    res.status(500).send("Không thể cập nhật hồ sơ.");
  }
};
