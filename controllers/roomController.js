const Room = require('../models/Room');
const Provider = require('../models/Provider'); 

exports.getAllRooms = async (req, res) => {
    try {
      const rooms = await Room.findAll({
        where: { approvalStatus: 'Đã duyệt' },
        include: { model: Provider }
      });
  
      res.render('home', { rooms });
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