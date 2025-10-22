// controllers/bookingController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const Provider = require('../models/Provider'); // Cần Provider để kiểm tra quyền

// SỬA LẠI HÀM NÀY: Lấy tất cả booking và gom nhóm
exports.listAllBookings = async (req, res) => {
    try {
      const providerId = req.session.provider.id;
  
      const allBookings = await Booking.findAll({
        include: [
          {
            model: Room,
            where: { providerId: providerId }, // Chỉ lấy phòng của provider này
            required: true,
            attributes: ['roomName'] // Chỉ cần tên phòng
          },
          {
            model: Customer,
            attributes: ['fullName', 'phoneNumber']
          },
          {
            model: Invoice, // Include Invoice để lấy trạng thái
            attributes: ['status'], // Chỉ cần trạng thái hóa đơn
            required: false // LEFT JOIN, vì đơn chờ/hủy chưa có hóa đơn
          }
        ],
        order: [
          // Ưu tiên trạng thái: Chờ -> Đang sử dụng -> Đã hủy
          sequelize.literal(`CASE Booking.status WHEN 'Chờ nhận phòng' THEN 1 WHEN 'Đang sử dụng' THEN 2 WHEN 'Đã hủy' THEN 3 ELSE 4 END`),
          ['checkInDate', 'ASC'] // Sau đó sắp xếp theo ngày nhận phòng
        ]
      });
  
      // Gom nhóm bookings theo trạng thái
      const groupedBookings = {
        pending: [],
        inUse: [],
        cancelled: []
      };
  
      allBookings.forEach(booking => {
        if (booking.status === 'Chờ nhận phòng') {
          groupedBookings.pending.push(booking);
        } else if (booking.status === 'Đang sử dụng') {
          groupedBookings.inUse.push(booking);
        } else if (booking.status === 'Đã hủy') {
          groupedBookings.cancelled.push(booking);
        }
        // Bỏ qua các trạng thái khác nếu có
      });
  
      res.render('provider/bookings', {
        pendingBookings: groupedBookings.pending,
        inUseBookings: groupedBookings.inUse,
        cancelledBookings: groupedBookings.cancelled
      });
  
    } catch (err) {
      console.error('Lỗi khi lấy danh sách đặt phòng:', err);
      res.status(500).send('Lỗi máy chủ');
    }
  };
// Hiển thị chi tiết
exports.showBookingDetails = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: { bookingId },
      include: [
        {
          model: Room,
          where: { providerId }, // Kiểm tra quyền sở hữu
          required: true
        },
        {
          model: Customer // Lấy đầy đủ thông tin khách hàng
        }
      ]
    });

    if (!booking) {
      return res.status(404).send('Không tìm thấy đơn đặt phòng này.');
    }

    res.render('provider/booking-details', { booking });
  } catch (err) {
    console.error('Lỗi khi xem chi tiết:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Xác nhận nhận phòng
exports.confirmCheckIn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const providerId = req.session.provider.id;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { bookingId, status: 'Chờ nhận phòng' },
      include: [{
        model: Room,
        where: { providerId },
        required: true
      }],
      transaction: t
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).send('Không tìm thấy đơn hoặc đơn đã được xử lý.');
    }

    // Cập nhật status booking
    await booking.update({ status: 'Đang sử dụng' }, { transaction: t });

    // Tạo hóa đơn
    await Invoice.create({
      bookingId: booking.bookingId,
      customerId: booking.customerId,
      amount: booking.totalAmount,
      invoiceDate: new Date(),
      status: 'Chờ thanh toán'
    }, { transaction: t });

    await t.commit();
    res.redirect('/provider/bookings');
  } catch (err) {
    await t.rollback();
    console.error('Lỗi khi xác nhận nhận phòng:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Hủy đơn
exports.cancelBooking = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { bookingId, status: 'Chờ nhận phòng' },
      include: [{
        model: Room,
        where: { providerId },
        required: true
      }]
    });

    if (!booking) {
      return res.status(404).send('Không tìm thấy đơn hoặc không thể hủy.');
    }

    // Cập nhật trạng thái
    await booking.update({ status: 'Đã hủy' });
    res.redirect('/provider/bookings');
  } catch (err) {
    console.error('Lỗi khi hủy đơn:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};