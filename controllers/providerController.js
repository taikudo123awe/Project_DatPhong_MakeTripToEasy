const Provider = require('../models/Provider');
const Room = require('../models/Room');
const PaymentInfo = require('../models/PaymentInfo'); // <-- THÊM MỚI

// ... (exports.showDashboard không đổi) ...
exports.showDashboard = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
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