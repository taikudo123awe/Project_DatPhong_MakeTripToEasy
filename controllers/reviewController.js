const Room = require("../models/Room");
const Customer = require("../models/Customer");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const Feedback = require("../models/Feedback");
const { Op } = require("sequelize");
const sequelize = require("../config/database");
// Bước 2: Hiển thị danh sách các phòng đã có đánh giá
exports.showReviewedRooms = async (req, res) => {
  try {
    const providerId = req.session.provider.id;

    const roomsWithReviews = await Room.findAll({
      where: { providerId },
      include: [
        {
          model: Review,
          required: true, // Chỉ lấy phòng CÓ đánh giá
          attributes: [], // Không cần lấy chi tiết review ở đây
        },
      ],
      // Đếm số lượng review
      attributes: [
        "roomId",
        "roomName",
        "price",
        [
          sequelize.fn("COUNT", sequelize.col("Reviews.reviewId")),
          "reviewCount",
        ],
      ],
      group: ["Room.roomId", "Room.roomName", "Room.price"],
      order: [["roomName", "ASC"]],
    });

    res.render("provider/reviews", { rooms: roomsWithReviews });
  } catch (err) {
    console.error("Lỗi khi lấy phòng có đánh giá:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Bước 3 & 4: Hiển thị chi tiết đánh giá của một phòng
exports.showRoomReviews = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    const { roomId } = req.params;

    const room = await Room.findOne({
      where: {
        roomId,
        providerId,
      },
      include: [
        {
          model: Review,
          include: [
            { model: Customer }, // Lấy tên khách hàng
            { model: Feedback }, // Lấy phản hồi (nếu có)
          ],
          order: [["reviewDate", "DESC"]],
        },
      ],
    });

    if (!room) {
      return res
        .status(404)
        .send("Không tìm thấy phòng hoặc bạn không có quyền.");
    }

    res.render("provider/review-details", { room });
  } catch (err) {
    console.error("Lỗi khi lấy chi tiết đánh giá:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Bước 5 & 6: Lưu phản hồi
exports.addFeedback = async (req, res) => {
  try {
    const providerId = req.session.provider.id;
    const { reviewId, message, roomId } = req.body; // roomId dùng để redirect

    // Kiểm tra xem đã phản hồi chưa (để tránh spam)
    const existingFeedback = await Feedback.findOne({ where: { reviewId } });
    if (existingFeedback) {
      return res.status(400).send("Đánh giá này đã được phản hồi.");
    }

    await Feedback.create({
      providerId,
      reviewId,
      message,
      feedbackDate: new Date(),
    });

    res.redirect(`/provider/reviews/${roomId}`);
  } catch (err) {
    console.error("Lỗi khi gửi phản hồi:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};
// Gửi đánh giá của khách hàng
exports.submitReview = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rating, comment } = req.body;
    const customerId = req.session.customer?.customerId;

    // 1️⃣ Kiểm tra đăng nhập
    if (!customerId) {
      return res.redirect("/customer/login");
    }

    // 2️⃣ Kiểm tra hợp lệ
    if (!rating || rating < 1 || rating > 5) {
      req.session.error = "Vui lòng chọn số sao hợp lệ (1–5).";
      return res.redirect(`/customer/history-detail/${bookingId}`);
    }

    // ✅ Không bắt buộc nhận xét nữa
    const commentText =
      comment && comment.trim().length > 0 ? comment.trim() : null;

    // 3️⃣ Kiểm tra booking có tồn tại không
    const booking = await Booking.findByPk(bookingId, { include: Room });
    if (!booking) {
      req.session.error = "Không tìm thấy thông tin đặt phòng.";
      return res.redirect("/customer/history-dashboard");
    }

    // 4️⃣ Kiểm tra đã đánh giá chưa
    const existingReview = await Review.findOne({
      where: {
        customerId,
        roomId: booking.Room.roomId,
      },
    });

    if (existingReview) {
      req.session.error = "Bạn đã đánh giá phòng này trước đó.";
      return res.redirect(`/customer/history-detail/${bookingId}`);
    }

    // 5️⃣ Lưu đánh giá
    await Review.create({
      customerId,
      roomId: booking.Room.roomId,
      rating,
      comment: commentText, // có thể null
      reviewDate: new Date(),
    });

    req.session.success = "✅ Cảm ơn bạn đã đánh giá phòng này!";
    res.redirect(`/customer/history-detail/${bookingId}`);
  } catch (err) {
    console.error("❌ Lỗi khi gửi đánh giá:", err);
    req.session.error = "Đã xảy ra lỗi khi gửi đánh giá. Vui lòng thử lại.";
    res.redirect(`/customer/history-detail/${req.params.bookingId}`);
  }
};
