// controllers/reportController.js
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const Room = require('../models/Room');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');

/** Helper: build date range by "today|week|month|year" */
function getRange(range) {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  switch ((range || 'today').toLowerCase()) {
    case 'today':
      break;
    case 'week': {
      const day = today.getDay() || 7; // Mon–Sun
      start.setDate(today.getDate() - (day - 1));
      end.setDate(start.getDate() + 6);
      break;
    }
    case 'month':
      start.setDate(1);
      end.setMonth(start.getMonth() + 1, 0);
      break;
    case 'year':
      start.setMonth(0, 1);
      end.setMonth(11, 31);
      break;
    default:
      break;
  }

  const toISO = (d) => d.toISOString().slice(0, 10);
  return { start: toISO(start), end: toISO(end) };
}

/** GET /provider/report/today */
exports.getTodayOverview = async (req, res) => {
  try {
    const providerId = req.session?.provider?.providerId;
    if (!providerId) return res.status(401).json({ message: 'Not logged in' });

    const queries = {
      totalRooms: `
        SELECT COUNT(*) AS totalRooms
        FROM Room
        WHERE providerId = :providerId;
      `,
      availableRooms: `
        SELECT COUNT(*) AS availableRooms
        FROM Room r
        WHERE r.providerId = :providerId
          AND r.roomId NOT IN (
            SELECT b.roomId FROM Booking b
            WHERE CURDATE() BETWEEN b.checkInDate AND b.checkOutDate
          );
      `,
      bookedRooms: `
        SELECT COUNT(DISTINCT b.roomId) AS bookedRooms
        FROM Booking b
        JOIN Room r ON r.roomId = b.roomId
        WHERE r.providerId = :providerId
          AND CURDATE() BETWEEN b.checkInDate AND b.checkOutDate;
      `,
      todayRevenue: `
        SELECT COALESCE(SUM(i.amount), 0) AS todayRevenue
        FROM Invoice i
        JOIN Booking b ON b.bookingId = i.bookingId
        JOIN Room r ON r.roomId = b.roomId
        WHERE r.providerId = :providerId
          AND i.status = 'Đã thanh toán'
          AND DATE(i.invoiceDate) = CURDATE();
      `
    };

    const [total]     = await sequelize.query(queries.totalRooms,     { replacements: { providerId }, type: sequelize.QueryTypes.SELECT });
    const [available] = await sequelize.query(queries.availableRooms, { replacements: { providerId }, type: sequelize.QueryTypes.SELECT });
    const [booked]    = await sequelize.query(queries.bookedRooms,    { replacements: { providerId }, type: sequelize.QueryTypes.SELECT });
    const [revenue]   = await sequelize.query(queries.todayRevenue,   { replacements: { providerId }, type: sequelize.QueryTypes.SELECT });

    res.json({
      totalRooms: total.totalRooms || 0,
      availableRooms: available.availableRooms || 0,
      bookedRooms: booked.bookedRooms || 0,
      todayRevenue: revenue.todayRevenue || 0
    });
  } catch (err) {
    console.error('getTodayOverview error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/** GET /provider/report/revenue?range=today|week|month|year */
exports.getRevenue = async (req, res) => {
  try {
    const providerId = req.session?.provider?.providerId;
    if (!providerId) return res.status(401).json({ message: 'Not logged in' });

    const range = (req.query.range || 'today').toLowerCase();
    const { start, end } = getRange(range);

    const groupExpr =
      range === 'year'
        ? `DATE_FORMAT(i.invoiceDate, '%Y-%m')`
        : `DATE(i.invoiceDate)`;

    const sql = `
      SELECT ${groupExpr} AS label, COALESCE(SUM(i.amount),0) AS revenue
      FROM Invoice i
      JOIN Booking b ON b.bookingId = i.bookingId
      JOIN Room r ON r.roomId = b.roomId
      WHERE r.providerId = :providerId
        AND i.status = 'Đã thanh toán'
        AND i.invoiceDate BETWEEN :start AND :end
      GROUP BY label
      ORDER BY label;
    `;

    const rows = await sequelize.query(sql, {
      replacements: { providerId, start, end },
      type: sequelize.QueryTypes.SELECT
    });

    res.json({ range, start, end, points: rows });
  } catch (err) {
    console.error('getRevenue error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/** GET /provider/report/room-status?range=today|week|month|year */
exports.getRoomStatus = async (req, res) => {
  try {
    const providerId = req.session?.provider?.providerId;
    if (!providerId) return res.status(401).json({ message: 'Not logged in' });

    const range = (req.query.range || 'today').toLowerCase();
    const { start, end } = getRange(range);

    const sql = `
      SELECT
        r.roomId,
        r.roomName,
        COALESCE(SUM(
          GREATEST(
            0,
            DATEDIFF(LEAST(b.checkOutDate, :end), GREATEST(b.checkInDate, :start)) + 1
          )
        ), 0) AS bookedNights
      FROM Room r
      LEFT JOIN Booking b
        ON b.roomId = r.roomId
       AND b.status = 'Đã đặt'
       AND b.checkOutDate >= :start
       AND b.checkInDate  <= :end
      WHERE r.providerId = :providerId
      GROUP BY r.roomId, r.roomName
      ORDER BY r.roomName;
    `;

    const rows = await sequelize.query(sql, {
      replacements: { providerId, start, end },
      type: sequelize.QueryTypes.SELECT
    });

    const totalDays =
      Math.floor((new Date(end) - new Date(start)) / (24 * 3600 * 1000)) + 1;

    const series = rows.map(r => ({
      roomName: r.roomName,
      booked: Number(r.bookedNights || 0),
      available: Math.max(totalDays - Number(r.bookedNights || 0), 0)
    }));

    res.json({ range, start, end, totalDays, rooms: series });
  } catch (err) {
    console.error('getRoomStatus error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
