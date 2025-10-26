const { Op } = require('sequelize');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Provider = require('../models/Provider');
const PaymentInfo = require('../models/PaymentInfo');
const Customer = require('../models/Customer');

// Bước 1: Hiển thị trang lịch sử đặt phòng
exports.showBookingHistory = async (req, res) => {
  try {
    const customerId = req.session.customer.customerId;
    const invoices = await Invoice.findAll({
      where: { customerId },
      include: {
        model: Booking,
        include: {
          model: Room,
          attributes: ['roomName']
        }
      },
      order: [['invoiceDate', 'DESC']]
    });

    res.render('customer/history', { invoices });
  } catch (err) {
    console.error('❌ Lỗi khi lấy lịch sử đặt phòng:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};

  // Bước 3 & 5 & 6: Hiển thị trang thông tin thanh toán
  exports.showPaymentPage = async (req, res) => {
    try {
      const { invoiceIds } = req.body;
      const customerId = req.session.customer.customerId;

      if (!invoiceIds || invoiceIds.length === 0) {
        // Nếu không chọn hóa đơn nào thì quay lại
        return res.redirect('/customer/history');
      }

      const invoices = await Invoice.findAll({
        where: {
          invoiceId: { [Op.in]: Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds] },
          customerId,
          status: 'Chờ thanh toán'
        },
        include: {
          model: Booking,
          include: {
            model: Room,
            include: {
              model: Provider,
              include: {
                model: PaymentInfo,
                required: true // Bắt buộc nhà cung cấp phải có thông tin thanh toán
              }
            }
          }
        }
      });

      if (invoices.length === 0) {
        return res.status(404).send('Không tìm thấy hóa đơn hợp lệ để thanh toán.');
      }

      // Nhóm các hóa đơn theo từng nhà cung cấp
      const providersToPay = {};
      invoices.forEach(invoice => {
        const provider = invoice.Booking.Room.Provider;
        if (!providersToPay[provider.providerId]) {
          providersToPay[provider.providerId] = {
            providerName: provider.providerName,
            paymentInfo: provider.PaymentInfos[0], // Lấy thông tin thanh toán đầu tiên
            invoices: [],
            totalAmount: 0
          };
        }
        providersToPay[provider.providerId].invoices.push(invoice);
        providersToPay[provider.providerId].totalAmount += invoice.amount;
      });

      res.render('customer/payment', { 
        providersToPay: Object.values(providersToPay),
        invoiceIds: invoices.map(inv => inv.invoiceId) // Truyền lại ID để dùng cho bước sau
      });

    } catch (err) {
      console.error('❌ Lỗi khi hiển thị trang thanh toán:', err);
      res.status(500).send('Lỗi máy chủ');
    }
  };

// Bước 7 & 8: Xác nhận đã chuyển tiền
exports.confirmPayment = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    const customerId = req.session.customer.customerId;

    if (!invoiceIds || invoiceIds.length === 0) {
      return res.redirect('/customer/history');
    }

    // Cập nhật trạng thái các hóa đơn đã chọn
    await Invoice.update(
      { status: 'Đã thanh toán' },
      {
        where: {
          invoiceId: { [Op.in]: Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds] },
          customerId
        }
      }
    );

    // TODO: Có thể thêm logic gửi email thông báo ở đây
    
    res.redirect('/customer/history'); // Quay lại lịch sử với thông báo thành công (có thể thêm)
  } catch (err) {
    console.error('❌ Lỗi khi xác nhận thanh toán:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};

exports.showEditProfile = async (req, res) => {
  try {
    const customerSession = req.session.customer;
    if (!customerSession) return res.redirect('/customer/login');

    const customer = await Customer.findByPk(customerSession.customerId);
    if (!customer) return res.status(404).send('Customer not found');

    const success = req.query.success === '1';

    res.render('customer/update', { 
      customer, 
      success,
      error: null        // ✅ thêm dòng này để tránh undefined trong EJS
    });
  } catch (err) {
    console.error('showEditProfile error:', err);
    res.status(500).send('Server error');
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, identityNumber } = req.body;
    const customerId = req.session.customer?.customerId;

    if (!customerId) return res.redirect('/customer/login');

    await Customer.update(
      { fullName, email, identityNumber },
      { where: { customerId } }
    );

    // Cập nhật session
    const updated = await Customer.findByPk(customerId);
    req.session.customer = updated;

    // ✅ chuyển hướng lại với thông báo thành công
    res.redirect('/customer/profile');
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).send('Server error');
  }
};
// ========================
// Xem tình trạng phiếu đặt phòng
// ========================
// exports.showBookingStatus = async (req, res) => {
//   try {
//     const customerId = req.session.customer?.customerId;
//     if (!customerId) return res.redirect('/customer/login');

//     // Lọc theo trạng thái (nếu có ?status=... trên URL)
//     const filterStatus = req.query.status || 'Tất cả';
//     const whereClause = { customerId };
//     if (filterStatus !== 'Tất cả') whereClause.status = filterStatus;

//     const bookings = await Booking.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Room,
//           attributes: ['roomName', 'image']
//         }
//       ],
//       order: [['bookingDate', 'DESC']]
//     });

//     // Danh sách trạng thái để hiển thị thanh chọn
//     const statuses = [
//       'Tất cả',
//       'Đang chờ',
//       'Đã xác nhận',
//       'Đã thanh toán',
//       'Đã nhận phòng',
//       'Hoàn tất',
//       'Đã hủy'
//     ];

//     res.render('customer/bookingStatus', { bookings, statuses, filterStatus });
//   } catch (err) {
//     console.error('❌ Lỗi khi lấy tình trạng đặt phòng:', err);
//     res.status(500).send('Lỗi máy chủ');
//   }
// };



exports.viewBookingHistory = async (req, res) => {
  try {
    const customerId = req.session.customer?.customerId;
    if (!customerId) return res.redirect('/customer/login');

    // Lọc theo booking status hoặc invoice status
    const filterStatus = req.query.status || 'all';

    const whereCondition = { customerId };

    if (filterStatus !== 'all') {
      if (filterStatus.startsWith('invoice:')) {
        // Ví dụ ?status=invoice:Đã thanh toán
        const invoiceStatus = filterStatus.split(':')[1];
        whereCondition['$invoice.status$'] = invoiceStatus;
      } else {
        // Lọc theo booking status
        whereCondition.status = filterStatus;
      }
    }

    const bookings = await Booking.findAll({
      where: whereCondition,
      include: [
        {
          model: Room,
          include: [{ model: Provider }]
        },
        {
          model: Invoice,
          as: 'invoice',
          required: false // có thể null
        }
      ],
      order: [['bookingDate', 'DESC']]
    });

    const statuses = [
      { label: 'Tất cả', value: 'all' },
      { label: 'Chờ nhận phòng', value: 'Chờ nhận' },
      { label: 'Đang sử dụng', value: 'Đang sử dụng' },
      { label: 'Đã hoàn thành', value: 'Đã hoàn thành' },
      { label: 'Đã hoàn thành', value: 'invoice:Đã thanh toán' },
      { label: 'Đã hủy', value: 'Đã hủy' }
    ];

    res.render('customer/history-dashboard', { bookings, statuses, filterStatus });
  } catch (error) {
    console.error('viewBookingHistory error:', error);
    res.status(500).send('Server error');
  }
};


exports.viewBookingDetail = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Room, include: [Provider] },
        { model: Invoice, as: 'invoice' }
      ]
    });

    if (!booking) {
      return res.status(404).send('Không tìm thấy đơn đặt phòng');
    }

    res.render('customer/history-detail', { booking });
  } catch (error) {
    console.error('viewBookingDetail error:', error);
    res.status(500).send('Server error');
  }
};