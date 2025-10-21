const Provider = require('../models/Provider');
const Room = require('../models/Room');
const PaymentInfo = require('../models/PaymentInfo');
const validator = require('validator');
const sequelize = require('../config/database');
const Account = require('../models/Account');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');

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
//Đếm tổng số phòng và số phòng có trạng thái chờ duyệt
exports.getDashboard = async (req, res) => {
    try {
        const admin = req.session.admin;

        const [totalRooms, pendingRooms] = await Promise.all([
            Room.count(),
            Room.count({ where: { approvalStatus: 'Chờ duyệt' } })
        ]);

        // Render ra view dashboard và truyền số liệu
        res.render('admin/dashboard', {
            admin,
            totalRooms,
            pendingRooms
        });
    } catch (err) {
        console.error('❌ Lỗi lấy số liệu dashboard:', err);
        res.status(500).send('Lỗi tải dashboard');
    }
};

//Phương thức này để xoá phòng của ADMIN
exports.deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const { reason } = req.body;

        // Validate lý do xóa
        if (!reason || reason.trim() === '') {
            return res.redirect(`/admin/rooms?error=${encodeURIComponent('Vui lòng nhập lý do xóa bài đăng!')}`);
        }

        // Tìm phòng cần xóa
        const room = await Room.findOne({
            where: { roomId: roomId },
            include: [
                {
                    model: Provider,
                    attributes: ['providerId', 'providerName', 'email']
                }
            ]
        });

        // Kiểm tra phòng có tồn tại không
        if (!room) {
            return res.redirect(`/admin/rooms?error=${encodeURIComponent('Phòng không tồn tại hoặc đã bị xóa!')}`);
        }

        // Lưu thông tin phòng trước khi xóa (để gửi thông báo)
        const roomName = room.roomName;
        const providerEmail = room.Provider ? room.Provider.email : null;
        const providerName = room.Provider ? room.Provider.providerName : null;
        const imagePath = room.image; // Lưu đường dẫn ảnh

        // Xóa ảnh vật lý nếu có
        if (imagePath) {
            const fullImagePath = path.join(__dirname, '..', 'public', imagePath);

            // Kiểm tra file có tồn tại không trước khi xóa
            if (fs.existsSync(fullImagePath)) {
                try {
                    fs.unlinkSync(fullImagePath);
                    console.log(`Đã xóa ảnh: ${fullImagePath}`);
                } catch (err) {
                    console.error(`Lỗi khi xóa ảnh: ${err.message}`);
                }
            }
        }

        // Xóa phòng khỏi database
        await room.destroy();

        console.log(`Admin đã xóa phòng ID: ${roomId}, Tên: ${roomName}, Lý do: ${reason}`);

        // TODO: Gửi email thông báo cho Provider (nếu cần)
        if (providerEmail) {
            // Ví dụ: Gọi hàm gửi email
            // await sendEmailToProvider(providerEmail, providerName, roomName, reason);

            console.log(`Cần gửi email thông báo đến: ${providerEmail}`);
            console.log(`Nội dung: Phòng "${roomName}" đã bị xóa. Lý do: ${reason}`);
        }

        // Chuyển hướng về danh sách phòng với thông báo thành công
        res.redirect(`/admin/rooms?success=${encodeURIComponent(`Đã xóa bài đăng "${roomName}" thành công!`)}`);

    } catch (error) {
        console.error('Lỗi khi xóa phòng:', error);
        res.redirect(`/admin/rooms?error=${encodeURIComponent('Đã xảy ra lỗi khi xóa bài đăng. Vui lòng thử lại!')}`);
    }
};
