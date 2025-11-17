const { Op, fn, col, literal } = require("sequelize");
const sequelize = require("../config/database");
const Room = require("../models/Room");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const Address = require("../models/Address");
const Review = require("../models/Review");
const Customer = require("../models/Customer");
const { getBookedRoomIds, buildRoomFilters, getRoomTypes, getAvailableRooms } = require("../utils/roomHelpers");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "Provider" },
      order: [["postedAt", "DESC"]],
    });
    const [roomTypes] = await sequelize.query(`
      SELECT rt.typeId, rt.typeName, COUNT(r.roomId) AS roomCount
      FROM RoomType rt
      JOIN Room r ON r.typeId = rt.typeId
      GROUP BY rt.typeId, rt.typeName
      ORDER BY roomCount DESC
      LIMIT 8;
    `);

    res.render("list", { rooms, roomTypes, });
  } catch (err) {
    console.error("❌ Lỗi khi tải danh sách phòng:", err);
    res.status(500).send("Lỗi khi tải danh sách phòng");
  }
};

// ===========================
// Lấy danh sách phòng cho trang chủ /
// ===========================
exports.getRoomsForHome = async (req, res) => {
  try {
    // ==============================
    // 🔹 1. Lấy danh sách phòng nổi bật
    // ==============================
    const featuredRooms = await Room.findAll({
      where: { approvalStatus: 'Đã duyệt' },
      include: [
        { model: Provider, as: 'Provider', attributes: ['providerName'], required: false },
        { model: Review, attributes: ['rating'], required: false },
        { model: Address, as: 'address', attributes: ['city', 'district', 'ward'], required: false },
      ],
      order: [['postedAt', 'DESC']],
      limit: 4,
    });

    // Tính trung bình sao và số lượt đánh giá
    const roomsWithComputed = featuredRooms.map((room) => {
      const reviews = room.Reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1)
          : "4.5";

      return {
        ...room.toJSON(),
        avgRating,
        reviewCount,
      };
    });

    // ==============================
    // 🔹 2. Lấy danh sách ưu đãi cuối tuần (ngẫu nhiên)
    // ==============================
    const weekendRooms = await Room.findAll({
      where: { approvalStatus: 'Đã duyệt' },
      include: [
        { model: Address, as: 'address', attributes: ['city', 'district'], required: false },
        { model: Review, attributes: ['rating'], required: false },
      ],
      limit: 4,
      order: sequelize.random(), // lấy ngẫu nhiên 4 phòng
    });

    const weekendDeals = weekendRooms.map((room) => {
      const reviews = room.Reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount).toFixed(1)
          : "4.5";

      // Tạo giảm giá ảo 10–40%
      const discountPercent = Math.floor(Math.random() * 30) + 10;
      const oldPrice = Math.round(room.price * (1 + discountPercent / 100));

      return {
        ...room.toJSON(),
        avgRating,
        reviewCount,
        oldPrice,
        discountPercent,
      };
    });

    // ==============================
    // 🔹 3. Render ra trang home
    // ==============================
    res.render('home', {
      rooms: roomsWithComputed,
      weekendDeals, // thêm dữ liệu ưu đãi vào home.ejs
    });
  } catch (err) {
    console.error('❌ Lỗi khi tải trang chủ:', err);
    res.status(500).send('Lỗi khi tải trang chủ');
  }
};


// ===========================
// Hiển thị form thêm phòng
// ===========================
exports.showAddRoomForm = async (req, res) => {
  try {
    const addresses = await Address.findAll({
      order: [
        ["city", "ASC"],
        ["district", "ASC"],
        ["ward", "ASC"],
      ],
    });

    res.render("provider/add-room", {
      error: null,
      success: null,
      addresses, // ✅ phải có dòng này
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải form thêm phòng:", err);
    res.status(500).send("Lỗi khi tải form thêm phòng");
  }
};

// ===========================
// Thêm phòng mới
// ===========================
exports.createRoom = async (req, res) => {
  try {
    const providerId = req.session.provider?.id;
    if (!providerId)
      throw new Error("Provider chưa đăng nhập hoặc session đã hết hạn.");

    const {
      roomName,
      customAddress, // tên đường / số nhà
      city,
      district,
      ward,
      capacity,
      availableRooms,
      price,
      amenities,
      description,
    } = req.body;

    console.log("📦 Dữ liệu nhận từ form:", req.body);
    const errors = [];

    // --- Validate dữ liệu cơ bản ---
    if (!roomName?.trim()) errors.push("Tên phòng không được để trống.");
    if (!city) errors.push("Vui lòng chọn thành phố.");
    if (!district) errors.push("Vui lòng chọn quận/huyện.");
    if (!ward) errors.push("Vui lòng chọn phường/xã.");
    if (!customAddress?.trim()) errors.push("Vui lòng nhập tên đường/số nhà.");
    if (!capacity || isNaN(capacity) || capacity < 1)
      errors.push("Sức chứa phải ≥ 1.");
    if (!availableRooms || isNaN(availableRooms) || availableRooms < 1)
      errors.push("Số lượng phòng hiện có phải ≥ 1.");
    if (!price || isNaN(price) || price <= 0)
      errors.push("Giá phòng phải là số > 0.");
    if (!amenities?.trim()) errors.push("Vui lòng nhập tiện ích của phòng.");
    if (!description?.trim()) errors.push("Vui lòng nhập mô tả phòng.");

    // --- Xử lý ảnh upload ---
    let imagePaths = [];
    if (!req.files || req.files.length === 0) {
      errors.push("Vui lòng tải lên ít nhất 1 ảnh phòng.");
    } else {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      req.files.forEach((file) => {
        if (allowedTypes.includes(file.mimetype)) {
          imagePaths.push(file.path.replace(/^public[\\/]/, ""));
        }
      });
    }

    // --- Nếu có lỗi thì render lại form ---
    if (errors.length > 0) {
      return res.render("provider/add-room", {
        error: errors.join("<br>"),
        success: null,
        addresses: [], // bỏ dùng addresses tĩnh
      });
    }

    // --- Tạo hoặc lấy Address tương ứng ---
    let address = await Address.findOne({
      where: { city, district, ward },
    });

    if (!address) {
      address = await Address.create({ city, district, ward });
      console.log("🆕 Tạo Address mới:", address.addressId);
    } else {
      console.log("✅ Dùng Address có sẵn:", address.addressId);
    }

    const addressId = address.addressId;
    const fullAddress = `${customAddress}, ${ward}, ${district}, ${city}`;
    const imageString = imagePaths.join(";");

    // --- Tạo phòng mới ---
    await Room.create({
      roomName,
      fullAddress,
      addressId,
      capacity,
      availableRooms,//thêm sức chứa
      price,
      amenities,
      description,
      image: imageString,
      providerId,
      status: "Hoạt động",
      approvalStatus: "Chờ duyệt",
      postedAt: new Date(),
    });

    req.session.success = "✅ Phòng đã được thêm thành công!";
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi thêm phòng:", err);
    res.status(500).send("Lỗi khi thêm phòng: " + err.message);
  }
};
// ===========================
// Chi tiết phòng
// ===========================
exports.getRoomDetail = async (req, res) => {
  const roomId = req.params.roomId;
  const { checkInDate, checkOutDate, numberOfGuests, numRooms } = req.query;

  try {
    const room = await Room.findOne({
      where: { roomId, approvalStatus: "Đã duyệt" },
      include: [
        { model: Provider, as: "Provider" },
        {
          model: Review,
          include: [{ model: Customer, attributes: ["fullName"] }],
          order: [["reviewDate", "DESC"]],
        },
      ],
    });

    if (!room) return res.status(404).send("Không tìm thấy phòng.");

    //lấy dữ liệu từ tìm kiếm
    res.render("rooms/detail", {
      room,
      checkInDate: checkInDate || "",
      checkOutDate: checkOutDate || "",
      numberOfGuests: numberOfGuests || "",
      quantity: numRooms || ""
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải thông tin phòng:", err);
    res.status(500).send("Lỗi khi tải thông tin phòng");
  }
};


// ===========================
// Hiển thị form chỉnh sửa
// ===========================
exports.showEditRoomForm = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).send("Không tìm thấy phòng.");
    res.render("provider/edit-room", { room, error: null });
  } catch (err) {
    console.error("❌ Lỗi khi tải form chỉnh sửa:", err);
    res.status(500).send("Lỗi khi tải form chỉnh sửa phòng.");
  }
};

// ===========================
// Cập nhật phòng
// ===========================
exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { roomName, fullAddress, capacity, price, amenities, description } =
      req.body;

    let image = null;
    if (req.files?.length > 0) {
      // Nếu upload nhiều ảnh thì nối chuỗi
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      const validImages = req.files
        .filter((f) => allowed.includes(f.mimetype))
        .map((f) => f.path.replace(/^public[\\/]/, ""));
      image = validImages.join(";");
    }

    // Lấy phòng hiện tại từ DB
    const room = await Room.findByPk(roomId);
    if (!room) {
      req.session.error = "Không tìm thấy phòng cần chỉnh sửa.";
      return res.redirect("/provider/dashboard");
    }

    // ✅ Logic xử lý trạng thái duyệt
    let approvalStatus = room.approvalStatus;
    if (room.approvalStatus === "Đã duyệt") {
      approvalStatus = "Chờ duyệt"; // nếu đã duyệt → chuyển lại chờ duyệt
    }

    const updateData = {
      roomName,
      fullAddress,
      capacity,
      price,
      amenities,
      description,
      approvalStatus,
    };

    if (image) updateData.image = image;

    await Room.update(updateData, { where: { roomId } });

    req.session.success =
      approvalStatus === "Chờ duyệt"
        ? "✅ Phòng đã được cập nhật. Trạng thái chuyển lại 'Chờ duyệt' để xem xét."
        : "✅ Phòng đã được cập nhật (vẫn đang chờ duyệt).";

    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật phòng:", err);
    req.session.error = "Đã xảy ra lỗi khi cập nhật phòng.";
    res.redirect("/provider/dashboard");
  }
};

// ===========================
// Xóa (ẩn) phòng — soft delete
// ===========================
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const providerId = req.session.provider?.id;

    // 1️⃣ Lấy phòng cần xóa
    const room = await Room.findByPk(roomId);

    if (!room) {
      req.session.error = "Không tìm thấy phòng cần xóa.";
      return res.redirect("/provider/dashboard");
    }

    // 2️⃣ Kiểm tra quyền sở hữu
    if (room.providerId !== providerId) {
      req.session.error = "Bạn không có quyền xóa phòng này.";
      return res.redirect("/provider/dashboard");
    }

    // 3️⃣ Chỉ đổi trạng thái, không xóa dữ liệu
    await Room.update({ status: "Ngưng hoạt động" }, { where: { roomId } });

    req.session.success = `🗑️ Phòng "${room.roomName}" đã được ẩn khỏi hệ thống (ngưng hoạt động).`;
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi ẩn phòng:", err);
    req.session.error = "Đã xảy ra lỗi khi ẩn phòng. Vui lòng thử lại.";
    res.redirect("/provider/dashboard");
  }
};

exports.searchRooms = async (req, res) => {
  try {
    const validated = req.validatedSearch || {};
    const city = validated.city || "";
    const district = validated.district || "";
    const ward = validated.ward || "";
    const checkInDate = validated.checkInDate || null;
    const checkOutDate = validated.checkOutDate || null;
    const numGuests = validated.numGuests || 1;
    const numRooms = validated.numRooms || 1;

    // 1️⃣ Lấy danh sách phòng đã bị đặt
    const bookedRoomIds = await getBookedRoomIds(checkInDate, checkOutDate);

    // 2️⃣ Tạo điều kiện lọc phòng
    const whereConditions = buildRoomFilters(req, bookedRoomIds, validated);

    // 3️⃣ Truy vấn danh sách phòng
    const availableRooms = await getAvailableRooms( whereConditions, city, district, ward, Room, Address, sequelize, Op );
    
    // 4️⃣ Lấy loại phòng
    const roomTypes = await getRoomTypes();

    // 5️⃣ Dữ liệu tìm kiếm
    const searchParams = {
      checkInDate: checkInDate ? checkInDate.toISOString().slice(0, 10) : "",
      checkOutDate: checkOutDate ? checkOutDate.toISOString().slice(0, 10) : "",
      numGuests,
      numRooms,
    };
    
    // 6️⃣ Render kết quả
    res.render("list", {
      rooms: availableRooms,
      roomTypes,
      searchParams,
      keyword: city || district || ward,
      quantity: numRooms,
      filters: {
        typeIds: req.query.typeId,
        priceRange: parseInt(req.query.priceRange) || null,
        capacity: parseInt(req.query.capacity) || null,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi khi tìm kiếm phòng:", err);
    res.status(500).send("Lỗi khi tìm kiếm phòng.");
  }
};

// lấy phòng theo thành phố
exports.listRoomsByCity = async (req, res) => {
  try {
    const { city, checkInDate, checkOutDate, numGuests } = req.query;

    const whereAddress = city
      ? {
        city: {
          [Op.like]: `%${city}%`,
        },
      }
      : {};

    const rooms = await Room.findAll({
      where: { approvalStatus: 'Đã duyệt' },
      include: [
        { model: Address, as: 'address', attributes: ['city', 'district', 'ward'], where: whereAddress, required: !!city, },
        { model: Provider, as: 'Provider', attributes: ['providerName'], required: false },
        { model: Review, attributes: ['rating'], required: false },
      ],
      order: [['postedAt', 'DESC']],
    });

    const searchParams = { city, checkInDate, checkOutDate, numGuests };

    const [roomTypes] = await sequelize.query(`
      SELECT rt.typeId, rt.typeName, COUNT(r.roomId) AS roomCount
      FROM RoomType rt
      JOIN Room r ON r.typeId = rt.typeId
      GROUP BY rt.typeId, rt.typeName
      ORDER BY roomCount DESC
      LIMIT 8;
    `);

    res.render('list', { rooms, city, searchParams, roomTypes, filters: { typeIds: req.query.typeId, priceRange: parseInt(req.query.priceRange) || null, capacity: parseInt(req.query.capacity) || null, }, });
  } catch (err) {
    console.error('❌ Lỗi khi lấy danh sách phòng:', err);
    res.status(500).send('Lỗi khi lấy danh sách phòng');
  }
};
//lấy phòng ưu đãi
exports.getWeekendDeals = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: [
        { model: Address, as: "address", attributes: ["city", "district"], required: false },
        { model: Review, attributes: ["rating"], required: false },
      ],
      limit: 4,
      order: sequelize.random(), // lấy ngẫu nhiên 4 phòng
    });

    // Tính rating trung bình và tạo giá giảm ảo
    const weekendDeals = rooms.map(room => {
      const reviews = room.Reviews || [];
      const avgRating = reviews.length
        ? (reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length).toFixed(1)
        : null;

      const discountPercent = Math.floor(Math.random() * 30) + 10; // 10–40%
      const oldPrice = Math.round(room.price * (1 + discountPercent / 100));

      return {
        ...room.toJSON(),
        avgRating,
        oldPrice,
        discountPercent,
      };
    });

    res.render("weekend-deals", { weekendDeals });
  } catch (err) {
    console.error("❌ Lỗi khi lấy ưu đãi cuối tuần:", err);
    res.status(500).send("Lỗi khi tải ưu đãi cuối tuần");
  }
};

