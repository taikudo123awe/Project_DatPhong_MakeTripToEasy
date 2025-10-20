const Provider = require('../models/Provider');
const Room = require('../models/Room');
const PaymentInfo = require('../models/PaymentInfo'); // <-- THÊM MỚI
const validator = require('validator');
// ... (exports.showDashboard không đổi) ...
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
    const providerId = req.session.provider.id;
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
      const providerId = req.session.provider.id;
      const { 
        providerName, 
        email, 
        phoneNumber, 
        taxCode, 
        bankName, 
        accountHolder,
        accountNumber
      } = req.body;
      const errors = [];
      //Kiem tra ten nha cung cap, ten ngan hang, ten chu tai khoan
      if (!providerName || providerName.trim() === '') {
        errors.push('Tên nhà cung cấp không được bỏ trống.');
      }
      if (!bankName || bankName.trim() === '') {
        errors.push('Tên ngân hàng không được bỏ trống.');
      }
      if (!accountHolder || accountHolder.trim() === '') {
        errors.push('Tên chủ tài khoản không được bỏ trống.');
      }
    // 1. Kiểm tra Email
    if (!email || !validator.isEmail(email)) {
      errors.push('Email không hợp lệ hoặc bị bỏ trống.');
    }

    // 2. Kiểm tra Số điện thoại
    if (!phoneNumber) {
      errors.push('Số điện thoại không được bỏ trống.');
    } else if (phoneNumber.length !== 10) {
      errors.push('Số điện thoại phải có đúng 10 ký tự.');
    } else if (!validator.isNumeric(phoneNumber, { no_symbols: true })) {
      errors.push('Số điện thoại chỉ được chứa số.');
    }

    // 3. Kiểm tra Số tài khoản
    // (Chỉ kiểm tra nếu một trong các trường bank có dữ liệu)
    if (bankName || accountHolder || accountNumber) {
      if (!accountNumber) {
        errors.push('Số tài khoản không được bỏ trống khi nhập thông tin ngân hàng.');
      } else if (!validator.isNumeric(accountNumber, { no_symbols: true })) {
        errors.push('Số tài khoản chỉ được chứa số.');
      }
    }
    
    // 4. Nếu có lỗi, render lại trang edit với lỗi
    if (errors.length > 0) {
      // Chúng ta cần lấy lại thông tin gốc để hiển thị QR
      const provider = await Provider.findByPk(providerId);
      const paymentInfo = await PaymentInfo.findOne({ where: { providerId } });

      return res.render('provider/edit-profile', {
        errors,       // Danh sách lỗi
        provider,     // Dữ liệu provider gốc
        paymentInfo,  // Dữ liệu payment gốc
        userInput: req.body // Dữ liệu người dùng vừa nhập (để fill lại form)
      });
    }
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
    // *** KẾT THÚC XỬ LÝ FILE ***
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
