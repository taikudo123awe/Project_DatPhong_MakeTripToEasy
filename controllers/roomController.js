const { Op } = require('sequelize');
const Room = require('../models/Room');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Address = require('../models/Address');
const sequelize = require('../config/database');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: 'Đã duyệt' },
      include: { model: Provider }
    });

    res.render('rooms/list', { rooms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải danh sách phòng');
  }
};
exports.showAddRoomForm = (req, res) => {
  res.render('provider/add-room');
};

exports.createRoom = async (req, res) => {
  try {
    const { roomName, capacity, price, description, image } = req.body;
    
    // 🔹 Sửa lại chỗ này: đúng key là "id"
    const providerId = req.session.provider.id;

    if (!providerId) {
      console.error("❌ Không tìm thấy providerId trong session!");
      return res.status(401).send('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn.');
    }

    await Room.create({
      roomName,
      capacity,
      price,
      description,
      image,
      providerId,
      approvalStatus: 'Chờ duyệt',
      postedAt: new Date()
    });

    console.log(`✅ Phòng mới được thêm bởi providerId = ${providerId}`);
    res.redirect('/provider/dashboard');
  } catch (err) {
    console.error('❌ Lỗi khi thêm phòng:', err);
    res.status(500).send('Lỗi khi thêm phòng');
  }
};


exports.getRoomDetail = async (req, res) => {
  const roomId = req.params.id;

  try {
    const room = await Room.findOne({
      where: { roomId, approvalStatus: 'Đã duyệt' },
      include: Provider
    });

    if (!room) {
      return res.status(404).send('Không tìm thấy phòng');
    }


    res.render('rooms/detail', { room });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải thông tin phòng');
  }
};

exports.getRoomsForHome = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: 'Đã duyệt', status: 'Hoạt động' },
      include: { model: Provider },
      order: [['postedAt', 'DESC']],
      limit: 8
    });

    const { error, address = '', checkIn = '', checkOut = '', guests = '1', rooms: roomNum = '1' } = req.query;

    res.render('home', {
      rooms,
      error,
      form: {
        address,
        checkIn,
        checkOut,
        guests,
        rooms: roomNum
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải phòng trang chủ');
  }
};

//Tìm kiếm phòng
exports.searchRooms = async (req, res) => {
  try {
    const { validatedSearch } = req;
    let city = '', checkInDate = null, checkOutDate = null, numGuests = 1, numRooms = 1;

    if (validatedSearch) {
      city = validatedSearch.city;
      checkInDate = validatedSearch.checkInDate;
      checkOutDate = validatedSearch.checkOutDate;
      numGuests = validatedSearch.numGuests || 1;
      numRooms = validatedSearch.numRooms || 1;
    }

    // ✅ B1: Tìm danh sách phòng đã bị đặt trùng khoảng ngày
    let bookedRoomIds = [];
    if (checkInDate && checkOutDate) {
      const overlappingBookings = await Booking.findAll({
        where: {
          [Op.and]: [
            { checkInDate: { [Op.lt]: checkOutDate } },
            { checkOutDate: { [Op.gt]: checkInDate } }
          ]
        },
        attributes: ['roomId']
      });
      bookedRoomIds = overlappingBookings.map((b) => b.roomId);
    }

    // ✅ B2: Lấy danh sách phòng trống
    const availableRooms = await Room.findAll({
      where: {
        [Op.and]: [
          bookedRoomIds.length > 0 ? { roomId: { [Op.notIn]: bookedRoomIds } } : {},
          { approvalStatus: 'Đã duyệt' },
          { status: 'Hoạt động' },
          { capacity: { [Op.gte]: numGuests } } // chỉ lấy phòng có đủ sức chứa
        ],
      },
      include: [
        {
          model: Address,
          as: 'address',
          where: city
            ? sequelize.where(
                sequelize.fn('LOWER', sequelize.col('address.city')),
                { [Op.like]: `%${city.toLowerCase()}%` }
              )
            : {},
          attributes: ['city', 'district', 'ward']
        }
      ],
      order: [['postedAt', 'DESC']]
    });

    if (!availableRooms || availableRooms.length === 0) {
      return res.render('list', {
        rooms: [],
        keyword: city,
        dateRange: `${checkInDate?.toISOString().slice(0,10)} to ${checkOutDate?.toISOString().slice(0,10)}`
      });
    }

    res.render('list', { rooms: availableRooms, keyword: city });
  } catch (err) {
    console.error('❌ Lỗi khi tìm kiếm phòng:', err);
    res.status(500).send('Lỗi khi tìm kiếm phòng.');
  }
};