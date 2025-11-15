const { Op } = require("sequelize");
const Invoice = require("../models/Invoice");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Provider = require("../models/Provider");
const PaymentInfo = require("../models/PaymentInfo");
const Customer = require("../models/Customer");
const Review = require("../models/Review");
const sequelize = require("../config/database");

const vnpay = require('../config/vnpay'); // <-- THÊM "THƯ VIỆN" VNPAY
const moment = require('moment'); // <-- THÊM MOMENT
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
// exports.showPaymentPage = async (req, res) => {
//   try {
//     const { invoiceIds } = req.body;
//     const customerId = req.session.customer.customerId;

//     if (!invoiceIds || invoiceIds.length === 0) {
//       // Nếu không chọn hóa đơn nào thì quay lại
//       return res.redirect("/customer/history");
//     }

//     const invoices = await Invoice.findAll({
//       where: {
//         invoiceId: {
//           [Op.in]: Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds],
//         },
//         customerId,
//         status: "Chờ thanh toán",
//       },
//       include: {
//         model: Booking,
//         include: {
//           model: Room,
//           include: {
//             model: Provider,
//             include: {
//               model: PaymentInfo,
//               required: true, // Bắt buộc nhà cung cấp phải có thông tin thanh toán
//             },
//           },
//         },
//       },
//     });

//     if (invoices.length === 0) {
//       return res
//         .status(404)
//         .send("Không tìm thấy hóa đơn hợp lệ để thanh toán.");
//     }

//     // Nhóm các hóa đơn theo từng nhà cung cấp
//     const providersToPay = {};
//     invoices.forEach((invoice) => {
//       const provider = invoice.Booking.Room.Provider;
//       if (!providersToPay[provider.providerId]) {
//         providersToPay[provider.providerId] = {
//           providerName: provider.providerName,
//           paymentInfo: provider.PaymentInfos[0], // Lấy thông tin thanh toán đầu tiên
//           invoices: [],
//           totalAmount: 0,
//         };
//       }
//       providersToPay[provider.providerId].invoices.push(invoice);
//       providersToPay[provider.providerId].totalAmount += invoice.amount;
//     });

//     res.render("customer/payment", {
//       providersToPay: Object.values(providersToPay),
//       invoiceIds: invoices.map((inv) => inv.invoiceId), // Truyền lại ID để dùng cho bước sau
//     });
//   } catch (err) {
//     console.error("❌ Lỗi khi hiển thị trang thanh toán:", err);
//     res.status(500).send("Lỗi máy chủ");
//   }
// };
// THAY THẾ showPaymentPage BẰNG HÀM NÀY
// Bước 1: Tạo URL thanh toán
// =============================================================
// 1. Sửa hàm tạo URL để gửi kèm invoiceIds
exports.createPaymentUrl = async (req, res) => {
  try {
    const { invoiceIds } = req.body;
    const customerId = req.session.customer.customerId;
    if (!invoiceIds || invoiceIds.length === 0) return res.redirect('/customer/history');
    const invoiceIdList = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];

    const invoices = await Invoice.findAll({
      where: { invoiceId: { [Op.in]: invoiceIdList }, customerId, status: 'Chờ thanh toán' }
    });

    if (invoices.length === 0) return res.status(404).send('Không tìm thấy hóa đơn hợp lệ.');

    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const ipAddr = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const vnp_TxnRef = moment().format('HHmmss');
    const orderInfo = "Thanh toan";
    
    // QUAN TRỌNG: Gửi kèm danh sách ID hóa đơn
    const extraData = JSON.stringify(invoiceIdList);

    const paymentUrl = vnpay.createPaymentUrl(vnp_TxnRef, totalAmount, orderInfo, ipAddr, extraData);
    res.redirect(paymentUrl);
  } catch (err) {
    console.error('❌ Lỗi tạo URL VNPay:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};
// Bước 7 & 8: Xác nhận đã chuyển tiền
// SỬA LẠI HÀM NÀY: Xác nhận đã chuyển tiền
// exports.confirmPayment = async (req, res) => {
//   const t = await sequelize.transaction(); // Bắt đầu transaction
//   try {
//     const { invoiceIds } = req.body;
//     const customerId = req.session.customer.customerId;

//     if (!invoiceIds || invoiceIds.length === 0) {
//       return res.redirect("/customer/history");
//     }

//     // Cập nhật trạng thái các hóa đơn đã chọn
//     // Đảm bảo invoiceIds luôn là một mảng
//     const invoiceIdList = Array.isArray(invoiceIds) ? invoiceIds : [invoiceIds];

//     // 1. Tìm các hóa đơn (để lấy bookingIds)
//     const invoices = await Invoice.findAll({
//       where: {
//         invoiceId: { [Op.in]: invoiceIdList },
//         customerId: customerId,
//         status: "Chờ thanh toán", // Chỉ cập nhật HĐ chờ thanh toán
//       },
//       attributes: ["bookingId"], // Chỉ cần lấy bookingId
//       transaction: t,
//     });

//     if (invoices.length === 0) {
//       await t.rollback();
//       return res.redirect("/customer/history"); // Không có gì để cập nhật
//     }

//     // Lấy danh sách các bookingId liên quan
//     const bookingIds = invoices.map((inv) => inv.bookingId);

//     // 2. Cập nhật trạng thái Hóa đơn (Invoice) thành "Đã thanh toán"
//     await Invoice.update(
//       { status: "Đã thanh toán" },
//       {
//         where: {
//           invoiceId: { [Op.in]: invoiceIdList },
//         },
//         transaction: t,
//       }
//     );

//     // 3. Cập nhật trạng thái Phiếu đặt phòng (Booking) thành "Đã hoàn thành"
//     // Chỉ cập nhật các phiếu đang ở trạng thái "Đang sử dụng"
//     await Booking.update(
//       { status: "Đã hoàn thành" },
//       {
//         where: {
//           bookingId: { [Op.in]: bookingIds },
//           status: "Đang sử dụng", // Điều kiện quan trọng
//         },
//         transaction: t,
//       }
//     );

//     await t.commit(); // Hoàn tất giao dịch

//     res.redirect("/customer/history");
//   } catch (err) {
//     await t.rollback(); // Hoàn tác nếu có lỗi
//     console.error("❌ Lỗi khi xác nhận thanh toán:", err);
//     res.status(500).send("Lỗi máy chủ");
//   }
// };

// HÀM MỚI
// Bước 2: Khách hàng quay về (vnp_ReturnUrl)
// =============================================================
// 2. Sửa hàm Return để cập nhật DB ngay lập tức
exports.vnpayReturn = async (req, res) => {
  try {
    const vnp_Params = req.query;
    const isVerified = vnpay.verifyReturn(vnp_Params);

    let message = "Giao dịch thất bại hoặc chữ ký không hợp lệ.";

    if (isVerified && vnp_Params['vnp_ResponseCode'] === '00') {
      const t = await sequelize.transaction();
      try {
        // Giải mã lấy invoiceIds từ vnp_OrderInfo
        const vnp_OrderInfo = decodeURIComponent(vnp_Params['vnp_OrderInfo']);
        const extraDataEncoded = vnp_OrderInfo.split('|')[1];
        const invoiceIdList = JSON.parse(Buffer.from(extraDataEncoded, 'base64').toString('utf8'));

        // Tìm các hóa đơn cần cập nhật
        const invoices = await Invoice.findAll({
            where: { invoiceId: { [Op.in]: invoiceIdList }, status: 'Chờ thanh toán' }, // Chỉ cập nhật nếu chưa thanh toán
            attributes: ['bookingId', 'invoiceId'],
            transaction: t
        });

        if (invoices.length > 0) {
            const bookingIds = invoices.map(inv => inv.bookingId);
            // Cập nhật Invoice
            await Invoice.update({ status: 'Đã thanh toán' }, { where: { invoiceId: { [Op.in]: invoiceIdList } }, transaction: t });
            // Cập nhật Booking
            await Booking.update({ status: 'Đã hoàn thành' }, { where: { bookingId: { [Op.in]: bookingIds }, status: 'Đang sử dụng' }, transaction: t });
            
            await t.commit();
            message = "Giao dịch thành công! Hóa đơn đã được cập nhật.";
        } else {
            await t.rollback();
            message = "Giao dịch thành công, nhưng hóa đơn đã được cập nhật trước đó.";
        }
      } catch (dbErr) {
          await t.rollback();
          console.error("❌ Lỗi cập nhật DB tại vnpayReturn:", dbErr);
          message = "Thanh toán thành công nhưng lỗi khi cập nhật hệ thống. Vui lòng liên hệ Admin.";
      }
    } else if (isVerified) {
        message = "Giao dịch thất bại. Mã lỗi VNPay: " + vnp_Params['vnp_ResponseCode'];
    }

    res.render('customer/payment-return', { message });
  } catch (err) {
    console.error('❌ Lỗi vnpayReturn:', err);
    res.render('customer/payment-return', { message: "Đã xảy ra lỗi trong quá trình xử lý." });
  }
};
// THAY THẾ confirmPayment BẰNG HÀM NÀY
// Bước 3: VNPay gọi IPN (vnp_IpnUrl) - Nơi cập nhật CSDL
// =============================================================
// controllers/customerController.js
// ...

// exports.vnpayIpn = async (req, res) => {
//   console.log("🔥 [IPN START] VNPay đang gọi vào IPN...");
//   console.log("👉 Query Params nhận được:", JSON.stringify(req.query, null, 2));


//   const t = await sequelize.transaction();
//   try {
//     let vnp_Params = req.query;
//     const vnp_SecureHash = vnp_Params['vnp_SecureHash'];
//     const vnp_ResponseCode = vnp_Params['vnp_ResponseCode'];
//     const vnp_TxnRef = vnp_Params['vnp_TxnRef'];
    
//     delete vnp_Params['vnp_SecureHash'];
//     delete vnp_Params['vnp_SecureHashType'];

//     vnp_Params = sortObject(vnp_Params);
//     const vnpay = require('../config/vnpay'); // Đảm bảo path đúng
//     const secretKey = process.env.VNP_HASH_SECRET;
    
//     // Tự tính lại hash để so sánh
//     const crypto = require('crypto');
//     const qs = require('qs');
//     const signData = qs.stringify(vnp_Params, { encode: false });
//     const hmac = crypto.createHmac("sha512", secretKey);
//     const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest("hex");
    
//     console.log("🔑 Hash tính toán:", signed);
//     console.log("🔑 Hash từ VNPay:", vnp_SecureHash);

//     if (signed === vnp_SecureHash) {
//       console.log("✅ Chữ ký hợp lệ.");
//       if (vnp_ResponseCode === '00') {
//         console.log("✅ Giao dịch thành công trên VNPay. Đang cập nhật DB...");

//         // Giải mã extraData
//         try {
//              const vnp_OrderInfo = decodeURIComponent(vnp_Params['vnp_OrderInfo']); // Decode trước
//              // Tùy vào cách VNPay trả về, có thể cần hoặc không cần decodeURIComponent. 
//              // Hãy xem log "Query Params nhận được" để điều chỉnh nếu cần.
//              // Nếu vnp_OrderInfo trong log không có ký tự %, có thể bỏ dòng decode trên.
             
//              const orderInfoParts = vnp_OrderInfo.split('|');
//              if (orderInfoParts.length < 2) {
//                  throw new Error("Format vnp_OrderInfo không đúng (thiếu dấu |)");
//              }
//              const extraDataEncoded = orderInfoParts[1];
//              const extraData = Buffer.from(extraDataEncoded, 'base64').toString('utf8');
//              const invoiceIdList = JSON.parse(extraData);
             
//              console.log("📦 Invoice IDs cần thanh toán:", invoiceIdList);

//              const invoices = await Invoice.findAll({
//                  where: {
//                      invoiceId: { [Op.in]: invoiceIdList },
//                      status: 'Chờ thanh toán'
//                  },
//                  attributes: ['bookingId', 'invoiceId'],
//                  transaction: t
//              });

//              console.log(`🔎 Tìm thấy ${invoices.length} hóa đơn 'Chờ thanh toán' hợp lệ.`);

//              if (invoices.length > 0) {
//                  const bookingIds = invoices.map(inv => inv.bookingId);
//                  await Invoice.update({ status: 'Đã thanh toán' }, { where: { invoiceId: { [Op.in]: invoiceIdList } }, transaction: t });
//                  await Booking.update({ status: 'Đã hoàn thành' }, { where: { bookingId: { [Op.in]: bookingIds }, status: 'Đang sử dụng' }, transaction: t });
//                  await t.commit();
//                  console.log("🎉 [IPN SUCCESS] Đã cập nhật Database thành công!");
//                  return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
//              } else {
//                  await t.rollback();
//                  console.log("⚠️ [IPN WARNING] Không tìm thấy hóa đơn nào (có thể đã được cập nhật trước đó).");
//                  return res.status(200).json({ RspCode: '02', Message: 'Order already confirmed' });
//              }
//         } catch (parseError) {
//              await t.rollback();
//              console.error("❌ Lỗi khi parse dữ liệu extraData:", parseError);
//              return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
//         }
//       } else {
//         console.log(`❌ Giao dịch thất bại trên VNPay. Mã lỗi: ${vnp_ResponseCode}`);
//         await t.commit(); // Không có gì để rollback, commit để đóng transaction
//         return res.status(200).json({ RspCode: '00', Message: 'Confirm Success' });
//       }
//     } else {
//       console.log("⛔ [IPN ERROR] Chữ ký không hợp lệ!");
//       await t.rollback();
//       return res.status(200).json({ RspCode: '97', Message: 'Invalid Checksum' });
//     }
//   } catch (err) {
//     await t.rollback();
//     console.error('❌ [IPN EXCEPTION]:', err);
//     return res.status(200).json({ RspCode: '99', Message: 'Unknown error' });
//   }
// };

exports.showEditProfile = async (req, res) => {
  try {
    const customerSession = req.session.customer;
    if (!customerSession) return res.redirect("/customer/login");

    const customer = await Customer.findByPk(customerSession.customerId);
    if (!customer) return res.status(404).send("Customer not found");

    const success = req.query.success === '1';

    res.render('customer/update', { 
      customer,
      success,
      error: null
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

    // ✅ chuyển hướng lại với thông báo thành công
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
function sortObject(obj) {
	let sorted = {};
	let str = [];
	let key;
	for (key in obj){
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