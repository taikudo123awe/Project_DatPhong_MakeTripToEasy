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

    // Lấy tất cả booking
    const allBookings = await Booking.findAll({
      include: [
        {
          model: Room,
          where: { providerId: providerId },
          required: true,
          attributes: ['roomName']
        },
        {
          model: Customer,
          attributes: ['fullName', 'phoneNumber']
        },
        {
          model: Invoice,
          attributes: ['status'],
          required: false
        }
      ],
      order: [
        // Sửa lại thứ tự sắp xếp
        sequelize.literal(`CASE Booking.status 
          WHEN 'Chờ nhận phòng' THEN 1 
          WHEN 'Đang sử dụng' THEN 2 
          WHEN 'Đã hoàn thành' THEN 3  
          WHEN 'Đã hủy' THEN 4 
          ELSE 5 END`),
        ['checkInDate', 'ASC']
      ]
    });

    // Gom nhóm bookings
    const groupedBookings = {
      pending: [],
      inUse: [],
      completed: [], // <-- THÊM MỚI
      cancelled: []
    };

    allBookings.forEach(booking => {
      if (booking.status === 'Chờ nhận phòng') {
        groupedBookings.pending.push(booking);
      } else if (booking.status === 'Đang sử dụng') {
        groupedBookings.inUse.push(booking);
      } else if (booking.status === 'Đã hoàn thành') { // <-- THÊM MỚI
        groupedBookings.completed.push(booking);
      } else if (booking.status === 'Đã hủy') {
        groupedBookings.cancelled.push(booking);
      }
    });

    res.render('provider/bookings', {
      pendingBookings: groupedBookings.pending,
      inUseBookings: groupedBookings.inUse,
      completedBookings: groupedBookings.completed, // <-- TRUYỀN BIẾN MỚI
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

// Hiển thị form đặt phòng cho khách
exports.showBookingForm = async (req, res) => {
  const roomId = req.params.roomId;
  try {
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).send("Không tìm thấy phòng");

    res.render("customer/booking", { room });
  } catch (err) {
    console.error("❌ Lỗi hiển thị form đặt phòng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Xử lý khi khách đặt phòng
exports.handleBooking = async (req, res) => {
  const { checkInDate, checkOutDate, numberOfGuests } = req.body;
  const customerId = req.session.customer.customerId;
  const roomId = req.params.roomId;

  try {
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).send("Không tìm thấy phòng");

    // --- TÍNH TOÁN SỐ ĐÊM VÀ TỔNG TIỀN ---
    const date1 = new Date(checkInDate);
    const date2 = new Date(checkOutDate);

    // Kiểm tra ngày hợp lệ (ngày trả phòng phải sau ngày nhận phòng)
    if (isNaN(date1) || isNaN(date2) || date1 >= date2) {
       // Nên có validate ở client-side, nhưng thêm ở đây để an toàn
      console.error("❌ Ngày nhận/trả phòng không hợp lệ:", checkInDate, checkOutDate);
      // Có thể render lại trang đặt phòng với lỗi
      return res.status(400).send("Ngày nhận phòng hoặc trả phòng không hợp lệ.");
    }

    // Tính số mili giây chênh lệch
    const timeDifference = date2.getTime() - date1.getTime();

    // Chuyển đổi mili giây sang số ngày (số đêm)
    const numberOfNights = Math.ceil(timeDifference / (1000 * 3600 * 24)); // 1000ms * 60s * 60m * 24h

    // Tính tổng tiền
    const totalAmount = room.price * numberOfNights;
    // --- KẾT THÚC TÍNH TOÁN ---

    await Booking.create({
      bookingDate: new Date(),
      checkInDate,
      checkOutDate,
      numberOfGuests,
      customerId,
      roomId,
      totalAmount, // Sử dụng totalAmount đã tính
      status: "Chờ nhận phòng"
    });

    // Chuyển hướng đến trang lịch sử/phiếu đặt phòng sau khi đặt thành công
    res.redirect("/customer/history");

  } catch (err) {
    console.error("❌ Lỗi khi đặt phòng:", err);
    // Có thể render lại trang đặt phòng với lỗi
    res.status(500).send("Đặt phòng thất bại. Vui lòng thử lại.");
  }
};

// Hiển thị danh sách các đơn đặt phòng của customer
exports.listCustomerBookings = async (req, res) => {
  try {
    const customerId = req.session.customer.customerId;

    const bookings = await Booking.findAll({
      where: { customerId },
      include: [Room], // Lấy thêm thông tin phòng
      order: [["bookingDate", "DESC"]]
    });

    res.render("customer/booking-list", { bookings });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách booking của khách:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Khách hàng hủy đặt phòng (chỉ khi đang "Chờ nhận phòng")
exports.cancelBookingByCustomer = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const customerId = req.session.customer?.customerId;

    if (!customerId) {
      return res.redirect('/customer/login');
    }

    // Tìm booking của khách hàng đang "Chờ nhận phòng"
    const booking = await Booking.findOne({
      where: { bookingId, customerId, status: 'Chờ nhận phòng' },
    });

    if (!booking) {
      req.session.error = 'Không thể hủy đơn này.';
      return res.redirect('/customer/history-dashboard');
    }

    // Cập nhật trạng thái booking
    await booking.update({ status: 'Đã hủy' });

    // Cập nhật hóa đơn (nếu có)
    await Invoice.update(
      { status: 'Đã hủy' },
      { where: { bookingId: booking.bookingId } }
    );

    req.session.success = 'Đã hủy đặt phòng thành công.';
    res.redirect('/customer/history-dashboard');
  } catch (err) {
    console.error('❌ Lỗi khi khách hủy đặt phòng:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};