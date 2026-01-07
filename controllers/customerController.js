const { Invoice, Booking, Room, Provider, PaymentInfo, Customer, Review, sequelize } = require("../models");
const { Op } = require("sequelize");

const vnpay = require("../config/vnpay");
const moment = require("moment");

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
      } else if (booking.Invoice && booking.Invoice.status === "Đã thanh toán") {
        grouped.paid.push(booking); // Lưu cả booking có invoice đã thanh toán
      } else if (booking.Invoice && booking.Invoice.status === "Chờ thanh toán") {
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

// 1. Sửa hàm tạo URL để gửi kèm invoiceIds
exports.createPaymentUrl = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    const customerId = req.session.customer.customerId;
    if (!invoiceIds || invoiceIds.length === 0)
      return res.redirect("/customer/history");
    const invoiceIdList = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];

    const invoices = await Invoice.findAll({
      where: {
        invoiceId: { [Op.in]: invoiceIdList },
        customerId,
        status: "Chờ thanh toán",
      },
    });

    if (invoices.length === 0)
      return res.status(404).send("Không tìm thấy hóa đơn hợp lệ.");

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const ipAddr = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const vnp_TxnRef = moment().format("HHmmss");
    const orderInfo = "Thanh toan";

    // QUAN TRỌNG: Gửi kèm danh sách ID hóa đơn
    const extraData = JSON.stringify(invoiceIdList);

    const paymentUrl = vnpay.createPaymentUrl(
      vnp_TxnRef,
      totalAmount,
      orderInfo,
      ipAddr,
      extraData
    );
    res.redirect(paymentUrl);
  } catch (err) {
    console.error("❌ Lỗi tạo URL VNPay:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

exports.vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isVerified = vnpay.verifyReturn(vnp_Params);

    let message = "Giao dịch thất bại hoặc chữ ký không hợp lệ.";

    if (isVerified && vnp_Params["vnp_ResponseCode"] === "00") {
      const t = await sequelize.transaction();
      try {
        // Giải mã lấy invoiceIds từ vnp_OrderInfo
        const vnp_OrderInfo = decodeURIComponent(vnp_Params["vnp_OrderInfo"]);
        const extraDataEncoded = vnp_OrderInfo.split("|")[1];
        const invoiceIdList = JSON.parse(
          Buffer.from(extraDataEncoded, "base64").toString("utf8")
        );

        // Tìm các hóa đơn cần cập nhật
        const invoices = await Invoice.findAll({
          where: {
            invoiceId: { [Op.in]: invoiceIdList },
            status: "Chờ thanh toán",
          }, // Chỉ cập nhật nếu chưa thanh toán
          attributes: ["bookingId", "invoiceId"],
          transaction: t,
        });

        if (invoices.length > 0) {
          const bookingIds = invoices.map((inv) => inv.bookingId);
          // Cập nhật Invoice
          await Invoice.update(
            { status: "Đã thanh toán" },
            { where: { invoiceId: { [Op.in]: invoiceIdList } }, transaction: t }
          );
          // Cập nhật Booking
          await Booking.update(
            { status: "Đã hoàn thành" },
            {
              where: {
                bookingId: { [Op.in]: bookingIds },
                status: "Đang sử dụng",
              },
              transaction: t,
            }
          );

          await t.commit();
          message = "Giao dịch thành công! Hóa đơn đã được cập nhật.";
        } else {
          await t.rollback();
          message =
            "Giao dịch thành công, nhưng hóa đơn đã được cập nhật trước đó.";
        }
      } catch (dbErr) {
        await t.rollback();
        console.error("❌ Lỗi cập nhật DB tại vnpayReturn:", dbErr);
        message =
          "Thanh toán thành công nhưng lỗi khi cập nhật hệ thống. Vui lòng liên hệ Admin.";
      }
    } else if (isVerified) {
      message =
        "Giao dịch thất bại. Mã lỗi VNPay: " + vnp_Params["vnp_ResponseCode"];
    }

    res.render("customer/payment-return", { message });
  } catch (err) {
    console.error("❌ Lỗi vnpayReturn:", err);
    res.render("customer/payment-return", {
      message: "Đã xảy ra lỗi trong quá trình xử lý.",
    });
  }
};

exports.showEditProfile = async (req, res) => {
  try {
    const customerSession = req.session.customer;
    if (!customerSession) return res.redirect("/customer/login");

    const customer = await Customer.findByPk(customerSession.customerId);
    if (!customer) return res.status(404).send("Customer not found");

    const success = req.query.success === "1";

    res.render("customer/update", {
      customer,
      success,
      error: null,
    });
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

    // chuyển hướng lại với thông báo thành công
    res.redirect("/customer/profile");
  } catch (err) {
    console.error("updateProfile error:", err);
    res.status(500).send("Server error");
  }
};

exports.viewBookingHistory = async (req, res) => {
  try {
    const customerId = req.session.customer?.customerId;
    if (!customerId) return res.redirect("/customer/login");

    // Lọc theo booking status hoặc invoice status
    const filterStatus = req.query.status || "all";

    const whereCondition = { customerId };

    if (filterStatus !== "all") {
      // Chuẩn hoá để tránh lỗi hoa/thường
      const normalizedStatus = filterStatus.toLowerCase();

      if (normalizedStatus.startsWith("invoice:")) {
        // VD: invoice: Đã thanh toán
        const invoiceStatus = filterStatus.split(":")[1].trim();

        whereCondition["$Invoice.status$"] = invoiceStatus;
      } else {
        // Lọc theo booking.status
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
        { model: Invoice },
      ],
    });

    if (!booking) return res.status(404).send("Không tìm thấy đơn đặt phòng");

    // Lấy review nếu khách đã đánh giá phòng này
    const existingReview = await Review.findOne({
      where: { customerId, roomId: booking.Room.roomId },
    });

    // Lấy message (nếu có)
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
          model: Invoice,
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

function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}
