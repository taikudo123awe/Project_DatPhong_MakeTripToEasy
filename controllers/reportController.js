const { Op, Sequelize } = require('sequelize');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');

exports.viewReport = async (req, res) => {
  try {
    const type = req.query.type || 'month'; // month / year / all
    const now = dayjs().tz('Asia/Ho_Chi_Minh');

    // ===== 1️⃣ Thống kê hôm nay =====
    const startOfDay = now.startOf('day').toDate();
    const endOfDay = now.endOf('day').toDate();

    const totalPaidBookings = await Invoice.count({
      where: {
        status: 'Đã thanh toán',
        invoiceDate: { [Op.between]: [startOfDay, endOfDay] },
      },
    });

    const totalRevenueToday =
      (await Invoice.sum('amount', {
        where: {
          status: 'Đã thanh toán',
          invoiceDate: { [Op.between]: [startOfDay, endOfDay] },
        },
      })) || 0;

    // ===== 2️⃣ Phòng trống hôm nay =====
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

    // ===== 3️⃣ Doanh thu theo thời gian =====
let groupByFn;
let whereClause = { status: 'Đã thanh toán' };
let revenueData = [];

if (type === 'month' || type === 'week') {
  // 👉 Gom nhóm theo ngày, chỉ lấy các ngày có dữ liệu
  groupByFn = Sequelize.fn('DATE', Sequelize.col('invoiceDate'));
  const startOfMonth = now.startOf('month').toDate();
  const endOfMonth = now.endOf('month').toDate();
  whereClause.invoiceDate = { [Op.between]: [startOfMonth, endOfMonth] };
} 
else if (type === 'year') {
  // 👉 Gom nhóm theo tháng, vẫn hiển thị đủ 12 tháng
  groupByFn = Sequelize.fn('MONTH', Sequelize.col('invoiceDate'));
  const startOfYear = now.startOf('year').toDate();
  const endOfYear = now.endOf('year').toDate();
  whereClause.invoiceDate = { [Op.between]: [startOfYear, endOfYear] };
} 
else if (type === 'all') {
  // 👉 Gom nhóm theo năm, hiển thị các năm có dữ liệu
  groupByFn = Sequelize.fn('YEAR', Sequelize.col('invoiceDate'));
}

// Lấy dữ liệu doanh thu thật
const revenueDataRaw = await Invoice.findAll({
  attributes: [
    [groupByFn, 'time'],
    [Sequelize.fn('SUM', Sequelize.col('amount')), 'total'],
  ],
  where: whereClause,
  group: ['time'],
  order: [[Sequelize.literal('time'), 'ASC']],
});

// Xử lý kết quả đầu ra
if (type === 'month' || type === 'week') {
  // 🔹 Chỉ những ngày có doanh thu > 0
  revenueData = revenueDataRaw.map(r => ({
    time: dayjs(r.dataValues.time).format('YYYY-MM-DD'),
    total: Number(r.dataValues.total),
  }));
} 
else if (type === 'year') {
  // 🔹 Vẫn hiển thị 12 tháng, nếu tháng nào không có thì = 0
  const revenueMap = {};
  for (let m = 1; m <= 12; m++) revenueMap[m] = 0;
  revenueDataRaw.forEach(r => {
    const month = Number(r.dataValues.time);
    revenueMap[month] = Number(r.dataValues.total);
  });
  revenueData = Object.entries(revenueMap).map(([month, total]) => ({
    time: Number(month),
    total,
  }));
} 
else if (type === 'all') {
  // 🔹 Hiển thị theo năm (chỉ năm có dữ liệu)
  revenueData = revenueDataRaw.map(r => ({
    time: r.dataValues.time,
    total: Number(r.dataValues.total),
  }));
}

    // ===== 4️⃣ Doanh thu theo phòng =====
    const roomRevenueRaw = await Invoice.findAll({
      attributes: [
        "bookingId",
        [Sequelize.fn("SUM", Sequelize.col("amount")), "total"],
      ],
      include: [
        {
          model: Booking,
          attributes: ["roomId"],
          as: "booking",
          include: [{ model: Room, attributes: ["roomName"] }],
        },
      ],
      where: { status: "Đã thanh toán" },
      group: ["Booking.roomId"],
    });

    const roomRevenue = roomRevenueRaw.map(r => ({
      total: Number(r.dataValues.total),
      Booking: {
        Room: { roomName: r.Booking?.Room?.roomName || 'Unknown' },
      },
    }));

    // ===== 5️⃣ Tình trạng phòng =====
    const roomStatusRaw = await Booking.findAll({
      attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('bookingId')), 'count']],
      group: ['status'],
    });

    const roomStatus = roomStatusRaw.map(r => ({
      status: r.dataValues.status,
      count: Number(r.dataValues.count),
    }));

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
