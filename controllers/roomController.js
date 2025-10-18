const { Op } = require('sequelize');
const Room = require('../models/Room');
const Provider = require('../models/Provider'); 

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
      const providerId = req.session.provider.providerId;
  
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
  
      res.redirect('/provider/dashboard');
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi khi thêm phòng');
    }
  };

  exports.searchRooms = async (req, res) => {
  try {
    const {
      address = '',
      checkIn = '',
      checkOut = '',
      guests = '1',
      rooms = '1'
    } = req.query;

    // Ép kiểu & chuẩn hóa
    const guestCount = Math.max(parseInt(guests, 10) || 1, 1);
    const roomCount  = Math.max(parseInt(rooms, 10) || 1, 1);
    const minCapacity = Math.ceil(guestCount / roomCount);

    // Validate ngày (bắt buộc có cả 2 và trả > nhận)
    if (!checkIn || !checkOut) {
      const qs = new URLSearchParams({ address, checkIn, checkOut, guests: guestCount, rooms: roomCount }).toString();
      return res.redirect(`/?error=Vui lòng chọn thời gian nhận và trả phòng&${qs}`);
    }
    const dIn  = new Date(checkIn);
    const dOut = new Date(checkOut);
    if (isNaN(dIn.getTime()) || isNaN(dOut.getTime()) || dOut <= dIn) {
      const qs = new URLSearchParams({ address, checkIn, checkOut, guests: guestCount, rooms: roomCount }).toString();
      return res.redirect(`/?error=Thời gian trả phòng phải sau thời gian nhận phòng&${qs}`);
    }

    // WHERE: đã duyệt + đủ sức chứa + khớp địa chỉ/từ khóa (roomName/description)
    const whereClause = {
      approvalStatus: 'Đã duyệt',
      capacity: { [Op.gte]: minCapacity }
    };

    if (address && address.trim()) {
      const kw = `%${address.trim()}%`;
      whereClause[Op.or] = [
        { roomName:   { [Op.like]: kw } },
        { description:{ [Op.like]: kw } }
      ];
    }

    // Tìm & render bằng view rooms/list.ejs như trang danh sách
    const roomsFound = await Room.findAll({
      where: whereClause,
      include: { model: Provider },
      order: [['postedAt', 'DESC']]
    });

    return res.render('rooms/list', { rooms: roomsFound });
  } catch (err) {
    console.error('❌ Lỗi tìm kiếm phòng:', err);
    return res.status(500).send('Lỗi khi tìm kiếm phòng');
  }
};