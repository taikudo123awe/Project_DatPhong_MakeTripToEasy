const Provider = require('../models/Provider');
const Room = require('../models/Room');
const PaymentInfo = require('../models/PaymentInfo');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');
const Account = require('../models/Account');

exports.showDashboard = async (req, res) => {
  try {
    const providerId = req.session.provider.id; // ✅ Sửa ở đây
    console.log('>> providerId:', providerId);

    const providerRooms = await Room.findAll({
      where: { providerId },
      order: [['postedAt', 'DESC']]
    });

    console.log('>> Số phòng tìm được:', providerRooms.length);

    res.render('provider/dashboard', {
      provider: req.session.provider,
      providerRooms
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách phòng:', err);
    res.status(500).send('Lỗi khi tải phòng');
  }
};



// --- CẬP NHẬT LOGIC EDIT PROFILE ---

// Hiển thị form với thông tin có sẵn
exports.showEditProfileForm = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const provider = await Provider.findByPk(providerId);

    // Tìm thông tin thanh toán ĐẦU TIÊN
    const paymentInfo = await PaymentInfo.findOne({
      where: { providerId }
    });

    if (!provider) {
      return res.status(404).send('Không tìm thấy nhà cung cấp.');
    }

    res.render('provider/edit-profile', {
      provider,
      paymentInfo // Gửi paymentInfo (có thể là null)
    });
  } catch (err) {
    console.error('❌ Lỗi khi lấy thông tin provider:', err);
    res.status(500).send('Lỗi khi tải trang chỉnh sửa');
  }
};

// Xử lý cập nhật thông tin
exports.updateProfile = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const {
      providerName,
      email,
      phoneNumber,
      taxCode,
      bankName,
      accountHolder,
      accountNumber
    } = req.body;

    // 1. Cập nhật thông tin Provider
    await Provider.update({
      providerName,
      email,
      phoneNumber,
      taxCode
    }, {
      where: { providerId }
    });

    // 2. Tìm hoặc Tạo/Cập nhật PaymentInfo
    const existingPaymentInfo = await PaymentInfo.findOne({
      where: { providerId }
    });

    const paymentData = {
      bankName,
      accountHolder,
      accountNumber,
      providerId
    };

    // *** XỬ LÝ FILE UPLOAD ***
    if (req.file) {
      // Nếu có file mới, lưu đường dẫn (vd: 'uploads/qrcodes/1-qr-123456.png')
      // Chúng ta bỏ 'public/' đi vì nó đã là thư mục gốc tĩnh
      paymentData.qrCode = req.file.path.replace('public\\', '').replace('public/', '');
    } else if (existingPaymentInfo) {
      // Nếu không có file mới, giữ lại QR cũ (nếu có)
      paymentData.qrCode = existingPaymentInfo.qrCode;
    }
    // *** KẾT THÚC XỬ LÝ FILE ***

    if (existingPaymentInfo) {
      // Nếu có, cập nhật
      await PaymentInfo.update(paymentData, {
        where: { paymentInfoId: existingPaymentInfo.paymentInfoId }
      });
    } else if (bankName || accountHolder || accountNumber || paymentData.qrCode) {
      // Nếu chưa có, VÀ người dùng có nhập gì đó (hoặc upload QR), thì tạo mới
      await PaymentInfo.create(paymentData);
    }

    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error('❌ Lỗi khi cập nhật thông tin:', err);
    res.status(500).send('Lỗi khi cập nhật thông tin');
  }
};
// controllers/providerController.js

exports.registerProvider = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { providerName, email, phoneNumber, identityNumber, taxCode, password, confirmPassword } = req.body;

    // 1️⃣ Kiểm tra mật khẩu nhập lại
    if (password !== confirmPassword) {
      return res.render('provider/register', { error: 'Mật khẩu nhập lại không khớp!', success: null, formData: req.body });
    }

    // 2️⃣ Kiểm tra trùng số điện thoại (username)
    const existing = await Account.findOne({ where: { username: phoneNumber } });
    if (existing) {
      return res.render('provider/register', { error: 'Số điện thoại đã được sử dụng!', success: null, formData: req.body });
    }

    // 3️⃣ Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Tạo tài khoản Account
    const account = await Account.create({
      username: phoneNumber,
      password: hashedPassword,
      role: 1
    }, { transaction: t });

    // 5️⃣ Tạo Provider
    await Provider.create({
      providerName,
      email,
      phoneNumber,
      identityNumber,
      taxCode,
      accountId: account.accountId
    }, { transaction: t });

    await t.commit();

    //Điều hướng sang login sau khi đăng ký thành công
    return res.redirect('/provider/login');

  } catch (error) {
    await t.rollback();
    return res.render('provider/register', {
      error: 'Đăng ký thất bại: ' + error.message,
      success: null,
      formData: req.body
    });
  }
};

// -----------------Xem báo cáo -------------------

// Hiển thị trang báo cáo của Provider
exports.showReport = async (req, res) => {
  try {
    const provider = req.session.provider; // Lấy thông tin provider từ session
    res.render('provider/report', { provider }); // Render giao diện report.ejs
  } catch (err) {
    console.error('showReport error:', err);
    res.status(500).send('Server error');
  }
};