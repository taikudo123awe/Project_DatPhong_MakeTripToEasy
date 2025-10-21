const Provider = require('../models/Provider');
const Room = require('../models/Room');
const PaymentInfo = require('../models/PaymentInfo');
const validator = require('validator');
const sequelize = require('../config/database');
const Account = require('../models/Account');


// 1️⃣ Hiển thị danh sách phòng (quản lý bài đăng)
exports.getAllRooms = async (req, res) => {
  try {
    const { status } = req.query; // lọc theo trạng thái
    const whereCondition = status ? { approvalStatus: status } : {};

    const rooms = await Room.findAll({
      where: whereCondition,
      include: [{ model: Provider, attributes: ['providerName', 'email'] }],
      order: [['postedAt', 'DESC']]
    });

    res.render('admin/roomList', { rooms, selectedStatus: status });
  } catch (error) {
    console.error('❌ Lỗi khi lấy danh sách phòng:', error);
    res.status(500).send('Lỗi khi tải danh sách phòng');
  }
};

// 2️⃣ Xem chi tiết bài đăng
exports.getRoomDetail = async (req, res) => {
  try {
    const room = await Room.findByPk(req.params.id, {
      include: [{ model: Provider, attributes: ['providerName', 'email', 'phoneNumber'] }]
    });

    if (!room) return res.status(404).send('Không tìm thấy bài đăng');

    res.render('admin/roomDetail', { room });
  } catch (error) {
    console.error('❌ Lỗi khi lấy chi tiết phòng:', error);
    res.status(500).send('Lỗi khi tải chi tiết phòng');
  }
};

// 3️⃣ Duyệt bài đăng
exports.approveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const room = await Room.findByPk(roomId);

    if (!room) return res.status(404).send('Không tìm thấy phòng');

    await room.update({ approvalStatus: 'Đã duyệt' });

    // 🔔 Gửi thông báo (ví dụ log ra console, hoặc sau này thêm gửi email)
    console.log(`✅ Phòng "${room.roomName}" đã được duyệt.`);

    res.redirect('/admin/rooms?status=Chờ duyệt');
  } catch (error) {
    console.error('❌ Lỗi khi duyệt phòng:', error);
    res.status(500).send('Lỗi khi duyệt phòng');
  }
};

// 4️⃣ Từ chối bài đăng
exports.rejectRoom = async (req, res) => {
  try {
    const { reason } = req.body;
    const roomId = req.params.id;

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).send('Không tìm thấy phòng');

    await room.update({ approvalStatus: 'Từ chối' });

    console.log(`❌ Phòng "${room.roomName}" bị từ chối. Lý do: ${reason}`);

    res.redirect('/admin/rooms?status=Chờ duyệt');
  } catch (error) {
    console.error('❌ Lỗi khi từ chối phòng:', error);
    res.status(500).send('Lỗi khi từ chối phòng');
  }
};
