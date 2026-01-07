// utils/checkRoom.js
const { Op } = require("sequelize");
const Booking = require("../models/Booking");

/**
 * Lấy số lượng phòng đã được đặt (booking.quantity) 
 * trong khoảng thời gian check-in / check-out truyền vào.
 */
async function getBookedRooms(roomId, checkInDate, checkOutDate) {
  const bookings = await Booking.findAll({
    where: {
      roomId,
      status: { [Op.not]: "Đã hủy" },
      [Op.and]: [
        { checkInDate: { [Op.lt]: checkOutDate } },
        { checkOutDate: { [Op.gt]: checkInDate } }
      ]
    }
  });

  return bookings.reduce((sum, booking) => {
    return sum + (booking.quantity || 1);
  }, 0);
}

module.exports = { getBookedRooms };
