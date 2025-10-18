const Account = require('../models/Account'); // Model Sequelize
const Provider = require('../models/Provider');
const bcrypt = require('bcrypt');


exports.showLoginForm = (req, res) => {
  res.render('auth/login');
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


exports.showRegisterForm = (req, res) => {
  res.render('register', { error: null });
};

exports.register = async (req, res) => {
  try {
    const { email, phoneNumber, taxCode, citizenId, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.render('register', { error: 'Mật khẩu không khớp!' });
    }

    // Kiểm tra email đã tồn tại
    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount) {
      return res.render('register', { error: 'Email đã được sử dụng!' });
    }

    // Tạo account
    const hashedPassword = await bcrypt.hash(password, 10);
    const account = await Account.create({ email, password: hashedPassword });

    // Tạo provider
    await Provider.create({
      email,
      phoneNumber,
      taxCode,
      citizenId,
      accountId: account.accountId
    });

    res.send('Đăng ký nhà cung cấp thành công!');
  } catch (err) {
    console.error(err);
    res.render('register', { error: 'Đã xảy ra lỗi, vui lòng thử lại.' });
  }
};

};
