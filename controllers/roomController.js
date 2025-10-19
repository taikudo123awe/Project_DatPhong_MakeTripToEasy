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

    res.render('home', { rooms });
  } catch (err) {
    console.error(err);
    res.status(500).send('Lỗi khi tải phòng trang chủ');
  }
};
