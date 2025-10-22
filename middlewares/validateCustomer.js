// middlewares/validateCustomer.js
const Account = require('../models/Account');
const Customer = require('../models/Customer');

// Regex kiểm tra định dạng
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const phoneRegex = /^0\d{9}$/; // 10 chữ số, bắt đầu bằng 0
const cccdRegex = /^\d{12}$/;  // CCCD phải 12 chữ số
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/; // ít nhất 8 ký tự, gồm chữ hoa, thường và số

module.exports = async (req, res, next) => {
  const { fullName, email, phoneNumber, identityNumber, password, confirmPassword } = req.body;

  try {
    // 1️⃣ Kiểm tra các trường bắt buộc
    if (!fullName || !email || !phoneNumber || !identityNumber || !password || !confirmPassword) {
      return res.render('customer/register', {
        error: 'Vui lòng nhập đầy đủ thông tin!',
        form: req.body
      });
    }

    // 2️⃣ Kiểm tra định dạng email
    if (!emailRegex.test(email)) {
      return res.render('customer/register', {
        error: 'Email không hợp lệ (vd: ten@gmail.com)',
        form: req.body
      });
    }

    // 3️⃣ Kiểm tra định dạng số điện thoại
    if (!phoneRegex.test(phoneNumber)) {
      return res.render('customer/register', {
        error: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0!',
        form: req.body
      });
    }

    // 4️⃣ Kiểm tra định dạng CCCD
    if (!cccdRegex.test(identityNumber)) {
      return res.render('customer/register', {
        error: 'CCCD phải gồm 12 chữ số!',
        form: req.body
      });
    }

    // 5️⃣ Kiểm tra mật khẩu
    if (!passwordRegex.test(password)) {
      return res.render('customer/register', {
        error: 'Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số!',
        form: req.body
      });
    }

    // 6️⃣ Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      return res.render('customer/register', {
        error: 'Mật khẩu nhập lại không khớp!',
        form: req.body
      });
    }

    // 7️⃣ Kiểm tra trùng dữ liệu trong DB
    const existingEmail = await Customer.findOne({ where: { email } });
    if (existingEmail) {
      return res.render('customer/register', {
        error: 'Email đã được đăng ký!',
        form: req.body
      });
    }

    const existingPhone = await Customer.findOne({ where: { phoneNumber } });
    if (existingPhone) {
      return res.render('customer/register', {
        error: 'Số điện thoại đã được sử dụng!',
        form: req.body
      });
    }

    const existingCCCD = await Customer.findOne({ where: { identityNumber } });
    if (existingCCCD) {
      return res.render('customer/register', {
        error: 'CCCD đã được sử dụng!',
        form: req.body
      });
    }

    next(); // ✅ Nếu tất cả hợp lệ → sang controller
  } catch (err) {
    console.error('❌ Lỗi validate dữ liệu đăng ký khách hàng:', err);
    return res.render('customer/register', {
      error: 'Có lỗi xảy ra trong quá trình kiểm tra dữ liệu!',
      form: req.body
    });
  }
};
