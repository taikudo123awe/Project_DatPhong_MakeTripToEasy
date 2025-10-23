const { Op, Sequelize } = require('sequelize');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');

exports.viewReport = async (req, res) => {
  try {
    const type = req.query.type || 'week';
    const now = new Date();

    // ====== 1️⃣ Thống kê hôm nay ======
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Tổng hóa đơn đã thanh toán hôm nay
    const totalPaidBookings = await Invoice.count({
      where: {
        status: 'Đã thanh toán',
        invoiceDate: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    // Tổng doanh thu hôm nay
    const totalRevenueToday =
      (await Invoice.sum('amount', {
        where: {
          status: 'Đã thanh toán',
          invoiceDate: { [Op.between]: [startOfDay, endOfDay] },
        },
      })) || 0;

    // Tổng phòng trống
    const totalRooms = await Room.count();
    const bookedRoomIds = await Booking.findAll({
      attributes: ['roomId'],
      where: {
        checkInDate: { [Op.lte]: endOfDay },
        checkOutDate: { [Op.gte]: startOfDay },
      },
      group: ['roomId'],
    });
    const availableRooms = totalRooms - bookedRoomIds.length;

    // ====== 2️⃣ Doanh thu theo thời gian ======
    let whereClause = { status: 'Đã thanh toán' };
    let groupByFn;

    if (type === 'week') {
      groupByFn = Sequelize.fn('DAY', Sequelize.col('invoiceDate'));
      const startOfWeek = new Date();
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date();
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      whereClause.invoiceDate = { [Op.between]: [startOfWeek, endOfWeek] };
    } else if (type === 'month') {
      groupByFn = Sequelize.fn('WEEK', Sequelize.col('invoiceDate'));
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      whereClause.invoiceDate = { [Op.between]: [startOfMonth, endOfMonth] };
    } else {
      groupByFn = Sequelize.fn('MONTH', Sequelize.col('invoiceDate'));
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const endOfYear = new Date(now.getFullYear(), 11, 31);
      whereClause.invoiceDate = { [Op.between]: [startOfYear, endOfYear] };
    }

    const revenueData = await Invoice.findAll({
      attributes: [
        [groupByFn, 'time'],
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
      ],
      where: whereClause,
      group: ['time'],
      order: [[Sequelize.literal('time'), 'ASC']],
    });

    // ====== 3️⃣ Doanh thu theo từng phòng ======
    const roomRevenue = await Invoice.findAll({
      attributes: [
        'bookingId',
        [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
      ],
      include: [
        {
          model: Booking,
          attributes: ['roomId'],
          include: [{ model: Room, attributes: ['roomName'] }],
        },
      ],
      where: { status: 'Đã thanh toán' },
      group: ['Booking.roomId'],
    });

    // ====== 4️⃣ Tình trạng phòng ======
    const roomStatus = await Booking.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('bookingId')), 'count']],
      group: ['status'],
    });
console.log('📊 revenueData:', revenueData.map(r => r.dataValues));
console.log('🏠 roomRevenue:', roomRevenue.map(r => r.dataValues));
console.log('🔹 roomStatus:', roomStatus.map(r => r.dataValues));
    // Render view
    res.render('provider/report', {
      totalPaidBookings,
      availableRooms,
      totalRevenueToday,
      revenueData,
      roomRevenue,
      roomStatus,
      type,
    });
  } catch (err) {
    console.error('viewReport error:', err);
    res.status(500).send('Server error');
  }
};
