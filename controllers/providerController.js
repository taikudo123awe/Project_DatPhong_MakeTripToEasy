// controllers/providerController.js
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const Account = require('../models/Account');
const Provider = require('../models/Provider');

exports.registerProvider = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { providerName, email, phoneNumber, cccd, taxCode, password, confirmPassword } = req.body;

    // 1️⃣ Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      return res.render('provider/register', { error: 'Mật khẩu nhập lại không khớp!', success: null });
    }

    // 2️⃣ Kiểm tra trùng số điện thoại (username)
    const existing = await Account.findOne({ where: { username: phoneNumber } });
    if (existing) {
      return res.render('provider/register', { error: 'Số điện thoại đã được sử dụng!', success: null });
    }

    // 3️⃣ Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Tạo tài khoản Account
    const account = await Account.create({
      username: phoneNumber,  // 👈 username = số điện thoại
      password: hashedPassword,
      role: 'provider'
    }, { transaction: t });

    // 5️⃣ Tạo Provider
    await Provider.create({
      providerName,
      email,
      phoneNumber,
      cccd,
      taxCode,
      accountId: account.accountId
    }, { transaction: t });

    await t.commit();

    return res.render('provider/register', { success: 'Đăng ký thành công! Vui lòng đăng nhập.', error: null });

  } catch (error) {
    await t.rollback();
    console.error('❌ Lỗi khi đăng ký nhà cung cấp:', error.message);
    console.error(error);
    return res.render('provider/register', {
  error: 'Đăng ký thất bại: ' + error.message,
  success: null
});
  }
};
