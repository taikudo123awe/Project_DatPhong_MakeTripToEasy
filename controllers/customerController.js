const Customer = require('../models/Customer');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
const Room = require('../models/Room');
const Provider = require('../models/Provider');

exports.showEditProfile = async (req, res) => {
  try {
    const customerSession = req.session.customer;
    if (!customerSession) return res.redirect('/customer/login');

    const customer = await Customer.findByPk(customerSession.customerId);
    if (!customer) return res.status(404).send('Customer not found');

    // ✅ truyền biến success để EJS dùng
    const success = req.query.success === '1';
    res.render('customer/update', { customer, success });
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
    res.redirect('/rooms');
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).send('Server error');
  }
};
// ========================
// Xem lịch sử đặt phòng
// ========================
exports.viewBookingHistory = async (req, res) => {
  try {
    const customerId = req.session.customer?.customerId;
    if (!customerId) return res.redirect('/customer/login');

    const bookings = await Booking.findAll({
      where: { customerId },
      include: [
        { model: Room, include: [Provider] },
        { model: Invoice, as: 'invoice' }
      ],
      order: [['bookingDate', 'DESC']]
    });

    res.render('customer/history', { bookings });
  } catch (err) {
    console.error('viewBookingHistory error:', err);
    res.status(500).send('Server error', err);
  }
};

// ========================
// Xem chi tiết 1 booking
// ========================
exports.viewBookingDetail = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const customerId = req.session.customer?.customerId;
    if (!customerId) return res.redirect('/customer/login');

    const booking = await Booking.findOne({
      where: { bookingId, customerId },
      include: [
        { model: Room, include: [Provider] },
        { model: Invoice, as: 'invoice' }
      ]
    });

    if (!booking) return res.status(404).send('Booking not found');

    res.render('customer/history_detail', { booking });
  } catch (err) {
    console.error('viewBookingDetail error:', err);
    res.status(500).send('Server error');
  }
};
