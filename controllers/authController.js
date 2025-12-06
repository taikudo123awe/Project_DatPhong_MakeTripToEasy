const sequelize = require("../config/database");
const Account = require("../models/Account");
const Provider = require("../models/Provider");
const Customer = require("../models/Customer");
const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const ProviderInfo = require("../models/ProviderInfo");

exports.showLoginForm = (req, res) => {
  res.render("provider/login", { error: null, success: null });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const account = await Account.findOne({
      where: { username, password, role: 1 },
    });

    if (!account) {
      return res.render("auth/login", {
        error: "Sai tài khoản hoặc mật khẩu!",
      });
    }

    // Tìm provider theo accountId
    const provider = await Provider.findOne({
      where: { accountId: account.accountId },
    });

    // Lưu session
    req.session.provider = {
      accountId: account.accountId,
      providerId: provider.providerId,
      username: account.username,

      // ⭐ THÊM 2 DÒNG DƯỚI — KHÔNG ẢNH HƯỞNG CODE CŨ
      name: provider.providerName,
      email: provider.email,
    };

    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error(err);
    res.render("auth/login", { error: "Có lỗi xảy ra khi đăng nhập" });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
};

//đăng ký customer
exports.showCustomerRegisterForm = (req, res) => {
  res.render("customer/register", { form: {} });
};

//Hàm đăng ký tài khoản customer
exports.registerCustomer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { fullName, email, phoneNumber, identityNumber, password } = req.body;

    // 1️⃣ Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Tạo tài khoản Account (role = 2: Customer)
    const account = await Account.create(
      {
        username: email,
        password: hashedPassword,
        role: 2,
      },
      { transaction: t }
    );

    // 3️⃣ Tạo bản ghi Customer
    await Customer.create(
      {
        fullName,
        email,
        phoneNumber,
        identityNumber,
        accountId: account.accountId,
      },
      { transaction: t }
    );

    await t.commit();
    return res.render("customer/login", {
      success: "Đăng ký thành công! Mời bạn đăng nhập.",
    });
  } catch (error) {
    await t.rollback();
    console.error("❌ Lỗi khi đăng ký khách hàng:", error);
    return res.render("auth/register", {
      error: "Đăng ký thất bại. Vui lòng thử lại!",
      form: req.body,
    });
  }
};

// Đăng nhập/ Đăng xuất của customer
// Hiển thị form đăng nhập Customer
exports.showCustomerLoginForm = (req, res) => {
  console.log("👉 showCustomerLoginForm triggered");
  res.render("customer/login");
};

// Xử lý đăng nhập Customer
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Account.role = 2 là customer (0: admin, 1: provider, 2: customer)
    const account = await Account.findOne({
      where: { username: email, role: 2 },
    });

    if (!account) {
      return res.render("customer/login", {
        error: "Sai email hoặc mật khẩu!",
      });
    }
    // --- THÊM KIỂM TRA STATUS ---
    if (account.status === "locked") {
      return res.render("customer/login", {
        error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
      });
    }
    if (account.status === "deleted") {
      return res.render("customer/login", {
        error: "Tài khoản không tồn tại.",
      });
    }
    // --- KẾT THÚC KIỂM TRA ---
    // 🔹 So sánh mật khẩu nhập vào với mật khẩu mã hoá trong DB
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.render("customer/login", {
        error: "Sai email hoặc mật khẩu!",
      });
    }

    // Lấy hồ sơ Customer qua accountId
    const customer = await Customer.findOne({
      where: { accountId: account.accountId },
    });

    if (!customer) {
      return res.render("customer/login", {
        error: "Tài khoản không hợp lệ.",
      });
    }

    // Lưu session riêng cho khách
    req.session.customer = {
      accountId: account.accountId,
      customerId: customer.customerId,
      fullName: customer.fullName,
      email: customer.email,
    };
    // Điều hướng đến trang danh sách phòng cho khách
    return res.redirect("/");
  } catch (err) {
    console.error("❌ Lỗi đăng nhập customer:", err);
    return res.render("customer/login", {
      error: "Có lỗi xảy ra khi đăng nhập.",
    });
  }
};
// Đăng xuất Customer
exports.logoutCustomer = (req, res) => {
  if (!req.session) return res.redirect("/");
  req.session.destroy((err) => {
    if (err) {
      console.error("❌ Lỗi huỷ session:", err);
      // fallback: xoá field customer và về trang chủ
      if (req.session) delete req.session.customer;
      return res.redirect("/");
    }
    // cookie mặc định của express-session là 'connect.sid'
    res.clearCookie("connect.sid");
    return res.redirect("/");
  });
};

// Hiển thị form đăng nhập Provider
exports.showProviderLoginForm = (req, res) => {
  res.render("provider/login", { error: null, success: null });
};

// Xử lý đăng nhập Provider
exports.loginProvider = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const account = await Account.findOne({ where: { username: phoneNumber } });

    if (!account) {
      return res.render("provider/login", {
        error: "Số điện thoại chưa được đăng ký!",
        success: null,
      });
    }
    // --- THÊM KIỂM TRA STATUS ---
    if (account.status === "locked") {
      return res.render("provider/login", {
        error: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.",
        success: null,
      });
    }
    if (account.status === "deleted") {
      return res.render("provider/login", {
        error: "Tài khoản không tồn tại.",
        success: null,
      });
    }
    // --- KẾT THÚC KIỂM TRA ---
    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.render("provider/login", {
        error: "Tài khoản hoặc mật khẩu không chính xác!",
        success: null,
      });
    }

    if (account.role !== 1) {
      return res.render("provider/login", {
        error: "Tài khoản không hợp lệ để đăng nhập với tư cách nhà cung cấp!",
        success: null,
      });
    }

    const provider = await Provider.findOne({
      where: { accountId: account.accountId },
    });

    req.session.provider = {
      providerId: provider.providerId,
      name: provider.providerName,
      email: provider.email,
    };
    // Kiểm tra NCC đã hoàn tất hồ sơ chưa
    const providerInfo = await ProviderInfo.findOne({
      where: { providerId: provider.providerId },
    });

    // Nếu CHƯA có hồ sơ → chuyển đến setup-profile
    if (!providerInfo) {
      return res.redirect("/provider/setup-profile");
    }
    //Nếu đăng nhập thành công → chuyển hướng
    return res.redirect("/provider/dashboard");
  } catch (error) {
    console.error("❌ Lỗi đăng nhập Provider:", error);
    return res.render("provider/login", {
      error: "Đăng nhập thất bại. Vui lòng thử lại!",
      success: null,
    });
  }
};

// Đăng xuất Provider
exports.logoutProvider = (req, res) => {
  req.session.provider = null;
  res.redirect("/provider/login");
};

//ADMIN========================================================================================================

// ADMIN: Hiển thị form đăng nhập
exports.showAdminLoginForm = (req, res) => {
  res.render("admin/login", { error: null, success: null });
};

// ADMIN: Xử lý đăng nhập
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body; // username ở đây là số điện thoại

  console.log(">>> req.body:", req.body);

  try {
    // Tìm admin theo số điện thoại
    const admin = await Admin.findOne({ where: { phoneNumber: username } });

    if (!admin) {
      return res.render("admin/login", {
        error: "Sai tài khoản hoặc mật khẩu!",
        success: null,
      });
    }

    // Lấy thông tin tài khoản
    const account = await Account.findOne({
      where: {
        accountId: admin.accountId,
        role: 0, // Admin
      },
    });

    if (!account) {
      return res.render("admin/login", {
        error: "Tài khoản không tồn tại hoặc không đúng vai trò!",
        success: null,
      });
    }

    const isMatch = await bcrypt.compare(password, account.password);

    if (!isMatch) {
      return res.render("admin/login", {
        // error: 'Mật khẩu không chính xác!',
        error: "Sai tài khoản hoặc mật khẩu!",
        success: null,
      });
    }

    // Lưu thông tin admin vào session
    req.session.admin = {
      adminId: admin.adminId,
      email: admin.email,
      phoneNumber: admin.phoneNumber,
      username: account.username,
    };

    return res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("❌ Lỗi đăng nhập Admin:", error);
    return res.render("admin/login", {
      error: "Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại.",
      success: null,
    });
  }
};

// ADMIN: Đăng xuất
exports.logoutAdmin = (req, res) => {
  req.session.admin = null;
  res.redirect("/admin/login");
};
