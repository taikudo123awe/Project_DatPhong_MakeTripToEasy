// middlewares/validateProvider.js
const Account = require('../models/Account');
const Provider = require('../models/Provider');

// Biểu thức regex để kiểm tra định dạng
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^0\d{9}$/; // 10 chữ số, bắt đầu bằng 0
const cccdRegex = /^\d{12}$/;  // 12 chữ số
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // ít nhất 8 ký tự, gồm chữ hoa, thường, số

module.exports = async (req, res, next) => {
  const { providerName, email, phoneNumber, cccd, taxCode, password, confirmPassword } = req.body;

  try {
    // 1️⃣ Kiểm tra trường trống
    if (!providerName || !email || !phoneNumber || !cccd || !password || !confirmPassword) {
      return res.render('provider/register', { error: 'Vui lòng nhập đầy đủ thông tin!', success: null });
    }

    // 2️⃣ Kiểm tra định dạng email
    if (!emailRegex.test(email)) {
      return res.render('provider/register', { error: 'Email không hợp lệ! (vd: abc12@gmail.com)', success: null });
    }

    // 3️⃣ Kiểm tra số điện thoại
    if (!phoneRegex.test(phoneNumber)) {
      return res.render('provider/register', { error: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0!', success: null });
    }

    // 4️⃣ Kiểm tra CCCD
    if (!cccdRegex.test(cccd)) {
      return res.render('provider/register', { error: 'Số CCCD phải gồm 12 chữ số!', success: null });
    }

    // 5️⃣ Kiểm tra mật khẩu
    if (!passwordRegex.test(password)) {
      return res.render('provider/register', {
        error: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số!',
        success: null
      });
    }

    // 6️⃣ Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      return res.render('provider/register', { error: 'Mật khẩu nhập lại không khớp!', success: null });
    }

    // 7️⃣ Kiểm tra trùng dữ liệu trong DB (email, phone, cccd, taxCode)
    const existingEmail = await Provider.findOne({ where: { email } });
    if (existingEmail) {
      return res.render('provider/register', { error: 'Email đã được đăng ký!', success: null });
    }

    const existingPhone = await Account.findOne({ where: { username: phoneNumber } });
    if (existingPhone) {
      return res.render('provider/register', { error: 'Số điện thoại đã được sử dụng!', success: null });
    }

    const existingCCCD = await Provider.findOne({ where: { cccd } });
    if (existingCCCD) {
      return res.render('provider/register', { error: 'CCCD đã được sử dụng!', success: null });
    }

    if (taxCode) {
      const existingTax = await Provider.findOne({ where: { taxCode } });
      if (existingTax) {
        return res.render('provider/register', { error: 'Mã số thuế đã được đăng ký!', success: null });
      }
    }

    // Nếu mọi thứ hợp lệ → chuyển sang controller
    next();
  } catch (error) {
    console.error('❌ Lỗi validate dữ liệu đăng ký:', error);
    return res.render('provider/register', { error: 'Có lỗi xảy ra trong quá trình kiểm tra dữ liệu!', success: null });
  }
};
