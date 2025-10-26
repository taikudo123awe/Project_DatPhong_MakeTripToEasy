const { Op } = require("sequelize");
const Invoice = require("../models/Invoice");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Provider = require("../models/Provider");
const PaymentInfo = require("../models/PaymentInfo");
const Customer = require("../models/Customer");
const Review = require("../models/Review");
// Lấy tất cả booking/invoice và gom nhóm theo trạng thái
exports.showBookingsByStatus = async (req, res) => {
  try {
    const customerId = req.session.customer.customerId;

    // Lấy tất cả các Booking của customer, kèm Room và Invoice (nếu có)
    const allBookings = await Booking.findAll({
      where: { customerId },
      include: [
        {
          model: Room,
          attributes: ["roomName"],
        },
        {
          model: Invoice,
          required: false, // LEFT JOIN
        },
      ],
      order: [["bookingDate", "DESC"]], // Sắp xếp theo ngày đặt mới nhất
    });

    // Gom nhóm
    const grouped = {
      all: allBookings,
      unpaid: [],
      paid: [],
      cancelled: [],
    };

    allBookings.forEach((booking) => {
      if (booking.status === "Đã hủy") {
        grouped.cancelled.push(booking);
      } else if (
        booking.Invoice &&
        booking.Invoice.status === "Đã thanh toán"
      ) {
        grouped.paid.push(booking); // Lưu cả booking có invoice đã thanh toán
      } else if (
        booking.Invoice &&
        booking.Invoice.status === "Chờ thanh toán"
      ) {
        grouped.unpaid.push(booking); // Lưu cả booking có invoice chờ thanh toán
      }
      // Các trạng thái khác của booking (VD: Đang sử dụng, Chờ nhận phòng mà chưa có Invoice)
      // vẫn nằm trong 'all' nhưng không vào 3 nhóm lọc chính
    });

    res.render("customer/history", {
      allBookings: grouped.all,
      unpaidBookings: grouped.unpaid,
      paidBookings: grouped.paid,
      cancelledBookings: grouped.cancelled,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lấy lịch sử đặt phòng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Bước 3 & 5 & 6: Hiển thị trang thông tin thanh toán
exports.showPaymentPage = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    const customerId = req.session.customer.customerId;

    if (!invoiceIds || invoiceIds.length === 0) {
      // Nếu không chọn hóa đơn nào thì quay lại
      return res.redirect("/customer/history");
    }

    const invoices = await Invoice.findAll({
      where: {
        invoiceId: {
          [Op.in]: Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds],
        },
        customerId,
        status: "Chờ thanh toán",
      },
      include: {
        model: Booking,
        include: {
          model: Room,
          include: {
            model: Provider,
            include: {
              model: PaymentInfo,
              required: true, // Bắt buộc nhà cung cấp phải có thông tin thanh toán
            },
          },
        },
      },
    });

    if (invoices.length === 0) {
      return res
        .status(404)
        .send("Không tìm thấy hóa đơn hợp lệ để thanh toán.");
    }

    // Nhóm các hóa đơn theo từng nhà cung cấp
    const providersToPay = {};
    invoices.forEach((invoice) => {
      const provider = invoice.Booking.Room.Provider;
      if (!providersToPay[provider.providerId]) {
        providersToPay[provider.providerId] = {
          providerName: provider.providerName,
          paymentInfo: provider.PaymentInfos[0], // Lấy thông tin thanh toán đầu tiên
          invoices: [],
          totalAmount: 0,
        };
      }
      providersToPay[provider.providerId].invoices.push(invoice);
      providersToPay[provider.providerId].totalAmount += invoice.amount;
    });

    res.render("customer/payment", {
      providersToPay: Object.values(providersToPay),
      invoiceIds: invoices.map((inv) => inv.invoiceId), // Truyền lại ID để dùng cho bước sau
    });
  } catch (err) {
    console.error("❌ Lỗi khi hiển thị trang thanh toán:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Bước 7 & 8: Xác nhận đã chuyển tiền
// SỬA LẠI HÀM NÀY: Xác nhận đã chuyển tiền
exports.confirmPayment = async (req, res) => {
  const t = await sequelize.transaction(); // Bắt đầu transaction
  try {
    const { invoiceIds } = req.body;
    const customerId = req.session.customer.customerId;

    if (!invoiceIds || invoiceIds.length === 0) {
      return res.redirect("/customer/history");
    }

    // Cập nhật trạng thái các hóa đơn đã chọn
    // Đảm bảo invoiceIds luôn là một mảng
    const invoiceIdList = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];

    // 1. Tìm các hóa đơn (để lấy bookingIds)
    const invoices = await Invoice.findAll({
      where: {
        invoiceId: { [Op.in]: invoiceIdList },
        customerId: customerId,
        status: "Chờ thanh toán", // Chỉ cập nhật HĐ chờ thanh toán
      },
      attributes: ["bookingId"], // Chỉ cần lấy bookingId
      transaction: t,
    });

    if (invoices.length === 0) {
      await t.rollback();
      return res.redirect("/customer/history"); // Không có gì để cập nhật
    }

    // Lấy danh sách các bookingId liên quan
    const bookingIds = invoices.map((inv) => inv.bookingId);

    // 2. Cập nhật trạng thái Hóa đơn (Invoice) thành "Đã thanh toán"
    await Invoice.update(
      { status: "Đã thanh toán" },
      {
        where: {
          invoiceId: { [Op.in]: invoiceIdList },
        },
        transaction: t,
      }
    );

    // 3. Cập nhật trạng thái Phiếu đặt phòng (Booking) thành "Đã hoàn thành"
    // Chỉ cập nhật các phiếu đang ở trạng thái "Đang sử dụng"
    await Booking.update(
      { status: "Đã hoàn thành" },
      {
        where: {
          bookingId: { [Op.in]: bookingIds },
          status: "Đang sử dụng", // Điều kiện quan trọng
        },
        transaction: t,
      }
    );

    await t.commit(); // Hoàn tất giao dịch

    res.redirect("/customer/history");
  } catch (err) {
    await t.rollback(); // Hoàn tác nếu có lỗi
    console.error("❌ Lỗi khi xác nhận thanh toán:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

exports.showEditProfile = async (req, res) => {
  try {
    const customerSession = req.session.customer;
    if (!customerSession) return res.redirect("/customer/login");

    const customer = await Customer.findByPk(customerSession.customerId);
    if (!customer) return res.status(404).send("Customer not found");

    // ✅ truyền biến success để EJS dùng
    const success = req.query.success === "1";
    res.render("customer/update", { customer, success });
  } catch (err) {
    console.error("showEditProfile error:", err);
    res.status(500).send("Server error");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, email, identityNumber } = req.body;
    const customerId = req.session.customer?.customerId;

    if (!customerId) return res.redirect("/customer/login");

    await Customer.update(
      { fullName, email, identityNumber },
      { where: { customerId } }
    );

    // Cập nhật session
    const updated = await Customer.findByPk(customerId);
    req.session.customer = updated;

    // ✅ chuyển hướng lại với thông báo thành công
    res.redirect("/customer/profile");
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).send("Server error");
  }
};
// ========================
// Xem tình trạng phiếu đặt phòng
// ========================
// exports.showBookingStatus = async (req, res) => {
//   try {
//     const customerId = req.session.customer?.customerId;
//     if (!customerId) return res.redirect('/customer/login');

//     // Lọc theo trạng thái (nếu có ?status=... trên URL)
//     const filterStatus = req.query.status || 'Tất cả';
//     const whereClause = { customerId };
//     if (filterStatus !== 'Tất cả') whereClause.status = filterStatus;

//     const bookings = await Booking.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Room,
//           attributes: ['roomName', 'image']
//         }
//       ],
//       order: [['bookingDate', 'DESC']]
//     });

//     // Danh sách trạng thái để hiển thị thanh chọn
//     const statuses = [
//       'Tất cả',
//       'Đang chờ',
//       'Đã xác nhận',
//       'Đã thanh toán',
//       'Đã nhận phòng',
//       'Hoàn tất',
//       'Đã hủy'
//     ];

//     res.render('customer/bookingStatus', { bookings, statuses, filterStatus });
//   } catch (err) {
//     console.error('❌ Lỗi khi lấy tình trạng đặt phòng:', err);
//     res.status(500).send('Lỗi máy chủ');
//   }
// };

exports.viewBookingHistory = async (req, res) => {
  try {
    const customerId = req.session.customer?.customerId;
    if (!customerId) return res.redirect("/customer/login");

    // Lọc theo booking status hoặc invoice status
    const filterStatus = req.query.status || "all";

    const whereCondition = { customerId };

    if (filterStatus !== "all") {
      if (filterStatus.startsWith("invoice:")) {
        // Ví dụ ?status=invoice:Đã thanh toán
        const invoiceStatus = filterStatus.split(":")[1];
        whereCondition["$invoice.status$"] = invoiceStatus;
      } else {
        // Lọc theo booking status
        whereCondition.status = filterStatus;
      }
    }

    const bookings = await Booking.findAll({
      where: whereCondition,
      include: [
        {
          model: Room,
          include: [{ model: Provider }],
        },
        {
          model: Invoice,
          as: "invoice",
          required: false, // có thể null
        },
      ],
      order: [["bookingDate", "DESC"]],
    });

    const statuses = [
      { label: "Tất cả", value: "all" },
      { label: "Chờ nhận phòng", value: "Chờ nhận" },
      { label: "Đang sử dụng", value: "Đang sử dụng" },
      { label: "Chưa thanh toán", value: "Chưa thanh toán" },
      { label: "Đã hoàn thành", value: "invoice:Đã thanh toán" },
      { label: "Đã hủy", value: "Đã hủy" },
    ];

    res.render("customer/history-dashboard", {
      bookings,
      statuses,
      filterStatus,
    });
  } catch (error) {
    console.error("viewBookingHistory error:", error);
    res.status(500).send("Server error");
  }
};

exports.viewBookingDetail = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const customerId = req.session.customer?.customerId;

    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Room, include: [Provider] },
        { model: Invoice, as: "invoice" },
      ],
    });

    if (!booking) return res.status(404).send("Không tìm thấy đơn đặt phòng");

    // ✅ Lấy review nếu khách đã đánh giá phòng này
    const existingReview = await Review.findOne({
      where: { customerId, roomId: booking.Room.roomId },
    });

    // ✅ Lấy message (nếu có)
    const error = req.session.error || null;
    const success = req.session.success || null;
    req.session.error = null;
    req.session.success = null;

    res.render("customer/history-detail", {
      booking,
      error,
      success,
      existingReview, // truyền sang view
    });
  } catch (error) {
    console.error("viewBookingDetail error:", error);
    res.status(500).send("Server error");
  }
};

// --- HÀM MỚI ĐỂ HIỂN THỊ CHI TIẾT BOOKING CHO CUSTOMER ---
exports.showCustomerBookingDetail = async (req, res) => {
  try {
    const customerId = req.session.customer.customerId;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      where: {
        bookingId: bookingId,
        customerId: customerId, // Đảm bảo booking này là của customer đang đăng nhập
      },
      include: [
        {
          model: Room,
          include: {
            model: Provider,
            attributes: ["providerName", "phoneNumber", "email"], // Lấy thông tin NCC
          },
          attributes: { exclude: ["providerId", "addressId"] }, // Loại bỏ khóa ngoại không cần thiết
        },
        {
          model: Customer, // Lấy lại thông tin customer nếu cần
          attributes: { exclude: ["accountId"] },
        },
        {
          model: Invoice, // Lấy thông tin hóa đơn (nếu có)
          required: false,
        },
      ],
    });

    if (!booking) {
      return res.status(404).send("Không tìm thấy phiếu đặt phòng.");
    }

    res.render("customer/booking-detail", { booking }); // Render view mới
  } catch (err) {
    console.error("❌ Lỗi khi xem chi tiết booking:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};
