const sequelize = require('../config/database');
const Account = require('../models/Account');
const Provider = require('../models/Provider');
const Customer = require('../models/Customer');
const bcrypt = require('bcrypt');

exports.showLoginForm = (req, res) => {
  res.render('provider/login', { error: null, success: null });
};


exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const account = await Account.findOne({ where: { username, password, role: 1 } });

    if (!account) {
      return res.render('auth/login', { error: 'Sai tài khoản hoặc mật khẩu!' });
    }

    // Tìm provider theo accountId
    const provider = await Provider.findOne({ where: { accountId: account.accountId } });

    // Lưu session
    req.session.provider = {
      accountId: account.accountId,
      providerId: provider.providerId,
      username: account.username
    };

    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { error: 'Có lỗi xảy ra khi đăng nhập' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

//đăng ký customer
exports.showCustomerRegisterForm = (req, res) => {
  res.render('customer/register', { form: {} });
};

//Hàm đăng ký tài khoản customer
exports.registerCustomer = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { fullName, email, phoneNumber, identityNumber, password } = req.body;

    // 1️⃣ Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Tạo tài khoản Account (role = 2: Customer)
    const account = await Account.create({
      username: email,
      password: hashedPassword,
      role: 2
    }, { transaction: t });

    // 3️⃣ Tạo bản ghi Customer
    await Customer.create({
      fullName,
      email,
      phoneNumber,
      identityNumber,
      accountId: account.accountId
    }, { transaction: t });

    await t.commit();
    return res.render('auth/customer-login', {
      success: 'Đăng ký thành công! Mời bạn đăng nhập.'
    });
  } catch (error) {
    await t.rollback();
    console.error('❌ Lỗi khi đăng ký khách hàng:', error);
    return res.render('auth/register', {
      error: 'Đăng ký thất bại. Vui lòng thử lại!',
      form: req.body
    });
  }
};

// Đăng nhập/ Đăng xuất của customer
// Hiển thị form đăng nhập Customer
exports.showCustomerLoginForm = (req, res) => {
  console.log('👉 showCustomerLoginForm triggered');
  res.render('customer/login');
};

// Xử lý đăng nhập Customer
exports.loginCustomer = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Account.role = 2 là customer (0: admin, 1: provider, 2: customer)
    const account = await Account.findOne({
      where: { username: email, password, role: 2 }
    });

    if (!account) {
      return res.render('customer/login', {
        error: 'Sai email hoặc mật khẩu!'
      });
    }

    // Lấy hồ sơ Customer qua accountId
    const customer = await Customer.findOne({
      where: { accountId: account.accountId }
    });

    if (!customer) {
      return res.render('customer/login', {
        error: 'Tài khoản không hợp lệ.'
      });
    }

    // Lưu session riêng cho khách
    req.session.customer = {
      accountId: account.accountId,
      customerId: customer.customerId,
      fullName: customer.fullName,
      email: customer.email
    };
    // Điều hướng đến trang danh sách phòng cho khách
    return res.redirect('/');
  } catch (err) {
    console.error('❌ Lỗi đăng nhập customer:', err);
    return res.render('customer/login', {
      error: 'Có lỗi xảy ra khi đăng nhập.'
    });
  }
};
  // Đăng xuất Customer
exports.logoutCustomer = (req, res) => {
  if (!req.session) return res.redirect('/');
  req.session.destroy(err => {
    if (err) {
      console.error('❌ Lỗi huỷ session:', err);
      // fallback: xoá field customer và về trang chủ
      if (req.session) delete req.session.customer;
      return res.redirect('/');
    }
    // cookie mặc định của express-session là 'connect.sid'
    res.clearCookie('connect.sid');
    return res.redirect('/');
  });
};