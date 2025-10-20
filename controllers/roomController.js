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