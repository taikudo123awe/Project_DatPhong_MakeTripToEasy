const { Op } = require('sequelize');
const Invoice = require('../models/Invoice');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Provider = require('../models/Provider');
const PaymentInfo = require('../models/PaymentInfo');

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