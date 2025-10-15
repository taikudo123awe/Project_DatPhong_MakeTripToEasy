const Account = require('../models/Account'); // Model Sequelize
const Provider = require('../models/Provider');

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
};
