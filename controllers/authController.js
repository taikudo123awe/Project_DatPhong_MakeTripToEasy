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
  res.render('auth/register', { form: {} });
};

exports.registerCustomer = async (req, res) => {
  const { email, phoneNumber, 	identityNumber, password, confirmPassword } = req.body;

  try {
    // 1) Kiểm tra hợp lệ cơ bản
    if (!email || !phoneNumber || !idCard || !password || !confirmPassword) {
      return res.render('auth/register', {
        error: 'Vui lòng nhập đầy đủ thông tin.',
        form: { email, phoneNumber, identityNumber}
      });
    }

    if (password !== confirmPassword) {
      return res.render('auth/register', {
        error: 'Mật khẩu xác nhận không khớp.',
        form: { email, phoneNumber, identityNumber }
      });
    }

    // 2) Email được dùng làm username -> không trùng
    const existed = await Account.findOne({ where: { username: email } });
    if (existed) {
      return res.render('auth/register', {
        error: 'Email đã được sử dụng để đăng ký tài khoản.',
        form: { email, phoneNumber, identityNumber}
      });
    }

    // 3) Tạo Account (role = 2: customer) + Customer trong 1 transaction
    await sequelize.transaction(async (t) => {
      const account = await Account.create(
        { username: email, password, role: 2 }, // 0: admin, 1: provider, 2: customer
        { transaction: t }
      );

      await Customer.create(
        { email, phoneNumber, identityNumber, accountId: account.accountId },
        { transaction: t }
      );
    });

    // 4) Trả về trang đăng nhập kèm thông báo thành công
    return res.render('auth/login', { success: 'Đăng ký thành công! Mời bạn đăng nhập.' });
  } catch (err) {
    console.error('❌ Lỗi đăng ký customer:', err);
    return res.render('auth/register', {
      error: 'Có lỗi xảy ra. Vui lòng thử lại.',
      form: { email, phoneNumber, idCard }
    });
  }
};

// Đăng nhập/ Đăng xuất của customer
// Hiển thị form đăng nhập Customer
exports.showCustomerLoginForm = (req, res) => {
  console.log('👉 Rendering customer login form...');
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
  if (req.session && req.session.customer) {
    delete req.session.customer;
  }
  res.redirect('/customer/login');
};

// Hiển thị form đăng nhập Provider
exports.showProviderLoginForm = (req, res) => {
  res.render('provider/login', { error: null, success: null });
};

// Xử lý đăng nhập Provider
exports.loginProvider = async (req, res) => {
  const { phoneNumber, password } = req.body;

  try {
    const account = await Account.findOne({ where: { username: phoneNumber } });

    if (!account) {
      return res.render('provider/login', {
        error: 'Số điện thoại chưa được đăng ký!',
        success: null
      });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.render('provider/login', {
        error: 'Mật khẩu không chính xác!',
        success: null
      });
    }

    if (account.role !== 1) {
      return res.render('provider/login', {
        error: 'Tài khoản không hợp lệ để đăng nhập với tư cách nhà cung cấp!',
        success: null
      });
    }

    const provider = await Provider.findOne({ where: { accountId: account.accountId } });

    req.session.provider = {
      id: provider.providerId,
      name: provider.providerName,
      email: provider.email,
    };

    //Nếu đăng nhập thành công → chuyển hướng
    return res.redirect('/provider/dashboard');

  } catch (error) {
    console.error('❌ Lỗi đăng nhập Provider:', error);
    return res.render('provider/login', {
      error: 'Đăng nhập thất bại. Vui lòng thử lại!',
      success: null
    });
  }
};

// Đăng xuất Provider
exports.logoutProvider = (req, res) => {
  req.session.provider = null;
  res.redirect('/provider/login');
};
