const Provider = require('../models/Provider');
const Room = require('../models/Room');
const Review = require('../models/Review');
const Feedback = require('../models/Feedback');
const Booking = require('../models/Booking');
const Invoice = require('../models/Invoice');
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
        const roomId = req.params.id;
        const { reason } = req.body;

        if (!reason || reason.trim() === '') {
            return res.redirect(
                `/admin/rooms?error=${encodeURIComponent('Vui lòng nhập lý do xóa bài đăng!')}`
            );
        }

        const room = await Room.findByPk(roomId, {
            include: [
                {
                    model: Provider,
                    attributes: ['providerId', 'providerName', 'email'],
                },
            ],
        });

        if (!room) {
            return res.redirect(
                `/admin/rooms?error=${encodeURIComponent('Phòng không tồn tại hoặc đã bị xóa!')}`
            );
        }

        const roomName = room.roomName;
        const providerEmail = room.Provider?.email || null;
        const imagePath = room.image;

        // ✅ Xóa ảnh nếu có
        if (imagePath) {
            const fullImagePath = path.join(__dirname, '..', 'public', imagePath);
            try {
                if (fs.existsSync(fullImagePath)) {
                    fs.unlinkSync(fullImagePath);
                    console.log(`🗑️ Đã xóa ảnh: ${fullImagePath}`);
                }
            } catch (err) {
                console.error(`⚠️ Lỗi khi xóa ảnh: ${err.message}`);
            }
        }

        // ✅ 1. Lấy tất cả reviewId của phòng
        const reviews = await Review.findAll({ where: { roomId } });
        const reviewIds = reviews.map(r => r.reviewId);

        // ✅ 2. Xóa feedback trước (nếu có)
        if (reviewIds.length > 0) {
            await Feedback.destroy({ where: { reviewId: reviewIds } });
            console.log(`🧹 Đã xóa feedback liên quan đến review.`);
        }

        // ✅ 3. Xóa review
        await Review.destroy({ where: { roomId } });

        // ✅ 4. Xóa Invoice & Booking
        const bookings = await Booking.findAll({ where: { roomId } });

        if (bookings.length > 0) {
            const bookingIds = bookings.map(b => b.bookingId);

            // ❗ Xóa Invoice trước để tránh lỗi khóa ngoại
            await Invoice.destroy({ where: { bookingId: bookingIds } });
            console.log(`🧾 Đã xóa hóa đơn liên quan đến phòng ${roomId}`);

            // Sau đó mới xóa Booking
            await Booking.destroy({ where: { roomId } });
            console.log(`📆 Đã xóa tất cả booking của phòng ${roomId}`);
        }

        // ✅ 5. Cuối cùng xóa phòng
        await room.destroy();

        console.log(`✅ Admin đã xóa phòng ID: ${roomId} | Tên: ${roomName} | Lý do: ${reason}`);

        if (providerEmail) {
            console.log(`📧 Gửi thông báo tới ${providerEmail}`);
            console.log(`Nội dung: Phòng "${roomName}" đã bị xóa. Lý do: ${reason}`);
        }

        res.redirect(
            `/admin/rooms?success=${encodeURIComponent(`Đã xóa bài đăng "${roomName}" thành công!`)}`
        );
    } catch (error) {
        console.error('❌ Lỗi khi xóa phòng:', error);
        res.redirect(
            `/admin/rooms?error=${encodeURIComponent('Đã xảy ra lỗi khi xóa bài đăng. Vui lòng thử lại!')}`
        );
    }
};

