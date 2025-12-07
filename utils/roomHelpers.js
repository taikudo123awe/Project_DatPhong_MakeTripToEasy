// utils/roomHelpers.js
const { Op } = require("sequelize");
const { sequelize, Booking } = require("../models");

/**
 * 🧩 Hàm 1: Lấy danh sách phòng đã bị đặt trong khoảng thời gian
 */
async function getBookedRoomIds(checkInDate, checkOutDate) {
    if (!checkInDate || !checkOutDate) return [];

    const bookings = await Booking.findAll({
        where: {
            [Op.and]: [
                { checkInDate: { [Op.lt]: checkOutDate } },
                { checkOutDate: { [Op.gt]: checkInDate } },
                { status: { [Op.ne]: "Đã hủy" } },
            ],
        },
        attributes: ["roomId"],
    });

    return bookings.map((b) => b.roomId);
}

/**
 * 🧩 Hàm 2: Xây dựng điều kiện lọc phòng
 */
function buildRoomFilters(req, bookedRoomIds, validated) {
  const numGuests = Number(validated.numGuests) || 1;
  const typeIds = req.query.typeId;
  const priceRange = req.query.priceRange ? parseInt(req.query.priceRange) : null;
  const capacity = req.query.capacity ? parseInt(req.query.capacity) : null;

  const filters = [];

  // Phòng chưa bị đặt
  if (bookedRoomIds?.length > 0) filters.push({ roomId: { [Op.notIn]: bookedRoomIds } });

  // Phòng hoạt động và đã duyệt
  filters.push({ approvalStatus: "Đã duyệt" });
  filters.push({ status: "Hoạt động" });

  // Lọc theo sức chứa
  if (numGuests) filters.push({ capacity: { [Op.gte]: numGuests } });
  if (capacity) filters.push({ capacity: { [Op.gte]: capacity } });

  // Lọc theo giá
  if (priceRange && !isNaN(priceRange)) filters.push({ price: { [Op.lte]: priceRange } });

  // Lọc theo loại phòng
  if (Array.isArray(typeIds)) filters.push({ typeId: { [Op.in]: typeIds.map(id => parseInt(id)) } });
  else if (typeIds) filters.push({ typeId: parseInt(typeIds) });

  return { [Op.and]: filters };
}

/**
 * 🧩 Hàm 3: Lấy danh sách loại phòng (để hiển thị bộ lọc)
 */
async function getRoomTypes() {
    const [roomTypes] = await sequelize.query(`
    SELECT rt.roomTypeId, rt.typeName, COUNT(r.roomId) AS roomCount
    FROM RoomType rt
    JOIN Room r ON r.roomTypeId = rt.roomTypeId
    GROUP BY rt.roomTypeId, rt.typeName
    ORDER BY roomCount DESC
    LIMIT 8;`);
    return roomTypes;
}

/**
 * 🧩 Hàm 4: Lấy danh sách phòng khả dụng theo điều kiện và vị trí
 */
async function getAvailableRooms(whereConditions, city, district, ward, Room, Address, sequelize, Op) {
    return await Room.findAll({
        where: whereConditions,
        include: [
            {
                model: Address,
                where: {
                    [Op.and]: [
                        city
                            ? sequelize.where(
                                sequelize.fn("LOWER", sequelize.col("Address.city")),
                                { [Op.like]: `%${city.toLowerCase()}%` }
                            )
                            : null,
                        district
                            ? sequelize.where(
                                sequelize.fn("LOWER", sequelize.col("Address.district")),
                                { [Op.like]: `%${district.toLowerCase()}%` }
                            )
                            : null,
                        ward
                            ? sequelize.where(
                                sequelize.fn("LOWER", sequelize.col("Address.ward")),
                                { [Op.like]: `%${ward.toLowerCase()}%` }
                            )
                            : null,
                    ].filter(Boolean),
                },
                attributes: ["city", "district", "ward"],
            },
        ],
        order: [["postedAt", "DESC"]],
    });
}

module.exports = {
    getBookedRoomIds,
    buildRoomFilters,
    getRoomTypes,
    getAvailableRooms,
};
