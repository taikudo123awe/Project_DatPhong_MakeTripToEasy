// controllers/bookingController.js
const { Op } = require("sequelize");
const sequelize = require("../config/database");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Customer = require("../models/Customer");
const Invoice = require("../models/Invoice");
const Address = require("../models/Address");
const Provider = require("../models/Provider");
const ProviderInfo = require("../models/ProviderInfo");

// SỬA LẠI HÀM NÀY: Lấy tất cả booking và gom nhóm
exports.listAllBookings = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    // ⭐ THÊM: LẤY PROVIDER
    const provider = await Provider.findOne({
      where: { providerId },
    });

    // ⭐ THÊM: LẤY PROVIDER INFO
    const providerInfo = await ProviderInfo.findOne({
      where: { providerId },
    });

    // Lấy tất cả booking
    const allBookings = await Booking.findAll({
      include: [
        {
          model: Room,
          where: { providerId: providerId },
          required: true,
          attributes: ["roomName"],
        },
        {
          model: Customer,
          attributes: ["fullName", "phoneNumber"],
        },
        {
          model: Invoice,
          attributes: ["status"],
          required: false,
        },
      ],
      order: [
        // Sửa lại thứ tự sắp xếp
        sequelize.literal(`CASE Booking.status 
          WHEN 'Chờ nhận phòng' THEN 1 
          WHEN 'Đang sử dụng' THEN 2 
          WHEN 'Đã hoàn thành' THEN 3  
          WHEN 'Đã hủy' THEN 4 
          ELSE 5 END`),
        ["checkInDate", "ASC"],
      ],
    });

    // Gom nhóm bookings
    const groupedBookings = {
      pending: [],
      inUse: [],
      completed: [], // <-- THÊM MỚI
      cancelled: [],
    };

    allBookings.forEach((booking) => {
      if (booking.status === "Chờ nhận phòng") {
        groupedBookings.pending.push(booking);
      } else if (booking.status === "Đang sử dụng") {
        groupedBookings.inUse.push(booking);
      } else if (booking.status === "Đã hoàn thành") {
        // <-- THÊM MỚI
        groupedBookings.completed.push(booking);
      } else if (booking.status === "Đã hủy") {
        groupedBookings.cancelled.push(booking);
      }
    });

    res.render("provider/bookings", {
      providerInfo,
      provider,
      pendingBookings: groupedBookings.pending,
      inUseBookings: groupedBookings.inUse,
      completedBookings: groupedBookings.completed, // <-- TRUYỀN BIẾN MỚI
      cancelledBookings: groupedBookings.cancelled,
      active: "bookings",
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách đặt phòng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Hiển thị chi tiết
exports.showBookingDetails = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const { bookingId } = req.params;

    // 🔹 Lấy provider
    const provider = await Provider.findOne({
      where: { providerId },
    });

    // 🔹 Lấy providerInfo
    const providerInfo = await ProviderInfo.findOne({
      where: { providerId },
    });

    const booking = await Booking.findOne({
      where: { bookingId },
      include: [
        {
          model: Room,
          where: { providerId }, // Kiểm tra quyền sở hữu
          required: true
        },
        {
          model: Customer, // Lấy đầy đủ thông tin khách hàng
        },
        {
          model: Invoice,
          required: false,
        },
      ],
    });

    if (!booking) {
      return res.status(404).send('Không tìm thấy đơn đặt phòng này.');
    }

    res.render("provider/booking-details", {
      booking,
      provider,
      providerInfo,
      active: "bookings",
    });
  } catch (err) {
    console.error('Lỗi khi xem chi tiết:', err);
    res.status(500).send('Lỗi máy chủ');
  }
};

// Xác nhận nhận phòng  
exports.confirmCheckIn = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const providerId = req.session.provider.providerId;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { bookingId, status: "Chờ nhận phòng" },
      include: [
        {
          model: Room,
          where: { providerId },
          required: true,
        },
      ],
      transaction: t,
    });

    if (!booking) {
      await t.rollback();
      return res.status(404).send("Không tìm thấy đơn hoặc đơn đã được xử lý.");
    }

    // Cập nhật status booking
    await booking.update({ status: "Đang sử dụng" }, { transaction: t });

    // Tạo hóa đơn
    await Invoice.create(
      {
        bookingId: booking.bookingId,
        customerId: booking.customerId,
        amount: booking.totalAmount,
        invoiceDate: new Date(),
        status: "Chờ thanh toán",
      },
      { transaction: t }
    );

    await t.commit();
    res.redirect("/provider/bookings");
  } catch (err) {
    await t.rollback();
    console.error("Lỗi khi xác nhận nhận phòng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Hủy đơn
exports.cancelBooking = async (req, res) => {
  try {
    const providerId = req.session.provider.providerId;
    const { bookingId } = req.body;

    const booking = await Booking.findOne({
      where: { bookingId, status: "Chờ nhận phòng" },
      include: [
        {
          model: Room,
          where: { providerId },
          required: true,
        },
      ],
    });

    if (!booking) {
      return res.status(404).send("Không tìm thấy đơn hoặc không thể hủy.");
    }

    // Cập nhật trạng thái
    await booking.update({ status: "Đã hủy" });
    res.redirect("/provider/bookings");
  } catch (err) {
    console.error("Lỗi khi hủy đơn:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Hiển thị form đặt phòng cho khách
exports.showBookingForm = async (req, res) => {
  const roomId = req.params.roomId;
  const { checkInDate, checkOutDate, numberOfGuests, quantity } = req.query; // lấy dữ liệu từ URL query

  try {
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).send("Không tìm thấy phòng");

    // Lấy thông tin khách hàng từ session
    let customer = null;
    if (req.session.customer && req.session.customer.customerId) {
      customer = await Customer.findByPk(req.session.customer.customerId);
    }

    // Nếu chưa đăng nhập thì lưu URL hiện tại để quay lại sau khi login
    if (!req.session.customer) {
      req.session.returnTo = req.originalUrl;
    }

    // Render view, truyền thêm dữ liệu đã chọn (nếu có)
    res.render("customer/booking", {
      room,
      customer,
      checkInDate: checkInDate || "",
      checkOutDate: checkOutDate || "",
      numberOfGuests: numberOfGuests || "",
      quantity: quantity || "",
      currentUrl: req.originalUrl,
      error: null
    });
    console.log("📍 currentUrl:", req.originalUrl);

  } catch (err) {
    console.error("❌ Lỗi hiển thị form đặt phòng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Xử lý khi khách đặt phòng
exports.handleBooking = async (req, res) => {
  const { checkInDate, checkOutDate, numberOfGuests, quantity } = req.body;
  const customerId = req.session.customer?.customerId;
  const roomId = req.params.roomId;

  if (!customerId) return res.redirect("/customer/login");

  const room = await Room.findByPk(roomId, {
    include: [{ model: Address, as: "Address" }]
  });

  if (!room) {
    return res.render("customer/booking", {
      error: "Không tìm thấy phòng.",
    });
  }

  const t = await sequelize.transaction();

  try {
    const qty = parseInt(quantity) || 1;
    const guests = parseInt(numberOfGuests) || 1;

    // 2️⃣ Kiểm tra số người tối đa
    if (guests > room.capacity) {
      await t.rollback();
      return res.render("customer/booking", {
        room,
        error: `Phòng này chỉ cho phép tối đa ${room.capacity} khách.`,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        quantity
      });
    }

    // 3️⃣ Kiểm tra số lượng phòng còn trống
    if (room.availableRooms !== null && qty > room.availableRooms) {
      await t.rollback();
      return res.render("customer/booking", {
        room,
        error: `Chỉ còn ${room.availableRooms} phòng trống.`,
        checkInDate,
        checkOutDate,
        numberOfGuests,
        quantity
      });
    }

    // 4️⃣ Kiểm tra ngày
    const date1 = new Date(checkInDate);
    const date2 = new Date(checkOutDate);

    if (isNaN(date1) || isNaN(date2) || date1 >= date2) {
      await t.rollback();
      console.error("❌ Ngày nhận/trả phòng không hợp lệ:", checkInDate, checkOutDate);
      return res.render("customer/booking", {
        room,
        error: "Ngày nhận phòng hoặc trả phòng không hợp lệ.",
        checkInDate,
        checkOutDate,
        numberOfGuests,
        quantity
      });
    }

    // 5️⃣ Tính số đêm và tổng tiền
    const timeDiff = date2.getTime() - date1.getTime();
    const numberOfNights = Math.ceil(timeDiff / (1000 * 3600 * 24));
    const totalAmount = room.price * numberOfNights * qty;

    // 6️⃣ Tạo booking
    await Booking.create(
      {
        bookingDate: new Date(),
        checkInDate,
        checkOutDate,
        numberOfGuests: guests,
        quantity: qty,
        customerId,
        roomId,
        totalAmount,
        status: "Chờ nhận phòng",
      },
      { transaction: t }
    );

    // 7️⃣ Trừ phòng
    if (room.availableRooms !== null) {
      await Room.update(
        { availableRooms: room.availableRooms - qty },
        { where: { roomId }, transaction: t }
      );
    }

    await t.commit();
    res.redirect("/customer/history");
  } catch (err) {
    await t.rollback();
    console.error("❌ Lỗi khi đặt phòng:", err);

    return res.render("customer/booking", {
      room,
      error: "Đặt phòng thất bại. Vui lòng thử lại.",
      checkInDate,
      checkOutDate,
      numberOfGuests,
      quantity
    });
  }
};


// Hiển thị danh sách các đơn đặt phòng của customer
exports.listCustomerBookings = async (req, res) => {
  try {
    const customerId = req.session.customer.customerId;

    const bookings = await Booking.findAll({
      where: { customerId },
      include: [Room], // Lấy thêm thông tin phòng
      order: [["bookingDate", "DESC"]],
    });

    res.render("customer/booking-list", { bookings });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách booking của khách:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};

// Khách hàng hủy đặt phòng (chỉ khi đang "Chờ nhận phòng")
exports.cancelBookingByCustomer = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const customerId = req.session.customer?.customerId;

    if (!customerId) {
      return res.redirect("/customer/login");
    }

    // Tìm booking của khách hàng đang "Chờ nhận phòng"
    const booking = await Booking.findOne({
      where: { bookingId, customerId, status: "Chờ nhận phòng" },
    });

    if (!booking) {
      req.session.error = "Không thể hủy đơn này.";
      return res.redirect("/customer/history-dashboard");
    }

    // Cập nhật trạng thái booking
    await booking.update({ status: "Đã hủy" });

    //cộng lại số lượng phòng sau khi huỷ
    try {
      const room = await Room.findByPk(booking.roomId);
      if (room) {
        const newAvailable =
          (room.availableRooms || 0) + (booking.quantity || 1);
        await room.update({ availableRooms: newAvailable });
        console.log(
          `✅ Cộng lại ${booking.quantity || 1} phòng vào ${room.roomName}`
        );
      }
    } catch (err2) {
      console.error("⚠️ Lỗi khi cộng lại phòng:", err2);
    }

    // Cập nhật hóa đơn (nếu có)
    await Invoice.update(
      { status: "Đã hủy" },
      { where: { bookingId: booking.bookingId } }
    );

    req.session.success = "Đã hủy đặt phòng thành công.";
    res.redirect("/customer/history-dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi khách hủy đặt phòng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
};
