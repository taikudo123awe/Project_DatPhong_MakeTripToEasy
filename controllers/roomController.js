const { Op, fn, col, literal } = require("sequelize");
const sequelize = require("../config/database");
const Room = require("../models/Room");
const Provider = require("../models/Provider");
const Address = require("../models/Address");
const Review = require("../models/Review");
const Customer = require("../models/Customer");
const { getBookedRoomIds, buildRoomFilters, getRoomTypes, getAvailableRooms } = require("../utils/roomHelpers");
const RoomType = require("../models/RoomType");
const Amenity = require("../models/Amenity");
const RoomName = require("../models/RoomName");
const ProviderInfo = require("../models/ProviderInfo");

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      include: [
        { model: Provider, as: "Provider", attributes: ["providerName"] },
        { model: RoomType, as: "RoomType", attributes: ["typeName"] },
        {
          model: Address,
          as: "Address",
          attributes: ["city", "district", "ward"],
        },
      ],
      order: [["postedAt", "DESC"]],
    });
    const [roomTypes] = await sequelize.query(`
      SELECT rt.roomTypeId, rt.typeName, COUNT(r.roomId) AS roomCount
      FROM RoomType rt
      JOIN Room r ON r.roomTypeId = rt.roomTypeId
      GROUP BY rt.roomTypeId, rt.typeName
      ORDER BY roomCount DESC
      LIMIT 8;` );

    res.render("list", { rooms, roomTypes, });
  } catch (err) {
    console.error("❌ Lỗi khi tải danh sách phòng:", err);
    res.status(500).send("Lỗi khi tải danh sách phòng");
  }
};

// ===========================
// Lấy danh sách phòng cho trang chủ
// ===========================
exports.getRoomsForHome = async (req, res) => {
  try {
    const featuredRooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: [
        { model: Provider, as: "Provider", attributes: ["providerName"] },
        {
          model: Review,
          as: "Reviews",
          attributes: ["rating"],
          required: false,
        },
        {
          model: Address,
          attributes: ["city", "district", "ward"],
        },
        { model: RoomType, as: "RoomType" },
        { model: Amenity, as: "Amenities", through: { attributes: [] } },
      ],
      order: [["postedAt", "DESC"]],
      limit: 4,
    });

    // tính trung bình rating
    const roomsWithComputed = featuredRooms.map((room) => {
      const reviews = room.Reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? (
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            ).toFixed(1)
          : "4.5";
      return { ...room.toJSON(), avgRating, reviewCount };
    });

    // chọn ngẫu nhiên 4 phòng để làm ưu đãi
    const weekendRooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: [
        { model: Address, as: "Address", attributes: ["city", "district"] },
        {
          model: Review,
          as: "Reviews",
          attributes: ["rating"],
          required: false,
        },
      ],
      order: sequelize.random(),
      limit: 4,
    });

    const weekendDeals = weekendRooms.map((room) => {
      const reviews = room.Reviews || [];
      const avgRating =
        reviews.length > 0
          ? (
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) /
              reviews.length
            ).toFixed(1)
          : "4.5";
      const discountPercent = Math.floor(Math.random() * 30) + 10;
      const oldPrice = Math.round(room.price * (1 + discountPercent / 100));
      return { ...room.toJSON(), avgRating, oldPrice, discountPercent };
    });

    res.render("home", { rooms: roomsWithComputed, weekendDeals });
  } catch (err) {
    console.error("❌ Lỗi khi tải trang chủ:", err);
    res.status(500).send("Lỗi khi tải trang chủ");
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
        { model: RoomType, as: "RoomType" },
        { model: Amenity, as: "Amenities", through: { attributes: [] } },
        {
          model: Review,
          as: "Reviews",
          include: [{ model: Customer, attributes: ["fullName"] }],
        },
      ],
    });

    if (!room) return res.status(404).send("Không tìm thấy phòng.");

    res.render("rooms/detail", {
      room,
      checkInDate: checkInDate || "",
      checkOutDate: checkOutDate || "",
      numberOfGuests: numberOfGuests || "",
      quantity: numRooms || "",
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải thông tin phòng:", err);
    res.status(500).send("Lỗi khi tải thông tin phòng");
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
      where: { approvalStatus: "Đã duyệt" },
      include: [
        {
          model: Provider,
          as: "Provider",
          attributes: ["providerName"],
          required: false,
        },
        { model: Review, attributes: ["rating"], required: false },
        {
          model: Address,
          as: "Address",
          attributes: ["city", "district", "ward"],
          required: false,
        },
      ],
      order: [["postedAt", "DESC"]],
      limit: 4,
    });

    // Tính trung bình sao và số lượt đánh giá
    const roomsWithComputed = featuredRooms.map((room) => {
      const reviews = room.Reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? (
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            ).toFixed(1)
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
      where: { approvalStatus: "Đã duyệt" },
      include: [
        {
          model: Address,
          as: "Address",
          attributes: ["city", "district"],
          required: false,
        },
        { model: Review, attributes: ["rating"], required: false },
      ],
      limit: 4,
      order: sequelize.random(), // lấy ngẫu nhiên 4 phòng
    });

    const weekendDeals = weekendRooms.map((room) => {
      const reviews = room.Reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? (
              reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
            ).toFixed(1)
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
    res.render("home", {
      rooms: roomsWithComputed,
      weekendDeals, // thêm dữ liệu ưu đãi vào home.ejs
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải trang chủ:", err);
    res.status(500).send("Lỗi khi tải trang chủ");
  }
};

// ===========================
// Hiển thị form thêm phòng
// ===========================
// ===========================
// Hiển thị form thêm phòng
// ===========================
exports.showAddRoomForm = async (req, res) => {
  try {
    const providerId = req.session.provider?.id;
    if (!providerId) return res.redirect("/provider/login");

    // 🔹 Lấy thông tin hồ sơ NCC (ProviderInfo)
    const providerInfo = await ProviderInfo.findOne({
      where: { providerId },
    });

    // 🔹 Lấy loại phòng + tên phòng
    const [roomTypes, roomNames] = await Promise.all([
      RoomType.findAll(),
      RoomName.findAll(),
    ]);

    // 🔹 Lấy tiện ích và gom nhóm
    const amenities = await Amenity.findAll({
      order: [
        ["category", "ASC"],
        ["amenityName", "ASC"],
      ],
    });

    const groupedAmenities = {};
    amenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      groupedAmenities[a.category].push(a);
    });

    res.render("provider/add-room", {
      error: {},
      form: {},
      success: null,
      roomTypes,
      roomNames,
      groupedAmenities,
      providerInfo, // ⭐ Gửi đúng ProviderInfo để EJS dùng
      layout: false,
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
  if (req.validationErrors && Object.keys(req.validationErrors).length > 0) {
    const providerId = req.session.provider?.id;
    const providerInfo = await ProviderInfo.findOne({ where: { providerId } });

    const [roomTypes, roomNames, amenities] = await Promise.all([
      RoomType.findAll(),
      RoomName.findAll(),
      Amenity.findAll({
        order: [
          ["category", "ASC"],
          ["amenityName", "ASC"],
        ],
      }),
    ]);

    const groupedAmenities = {};
    amenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      groupedAmenities[a.category].push(a);
    });

    return res.render("provider/add-room", {
      error: req.validationErrors,
      form: req.body,
      success: null,
      roomTypes,
      roomNames,
      groupedAmenities,
      providerInfo, // ⭐ MUST HAVE
      layout: false,
    });
  }

  const t = await sequelize.transaction();
  try {
    const providerId = req.session.provider?.id;
    if (!providerId)
      throw new Error("Provider chưa đăng nhập hoặc session đã hết hạn.");

    const {
      roomNameId,
      customAddress,
      city,
      district,
      ward,
      capacity,
      availableRooms,
      price,
      description,
      roomTypeId,
      amenities = [],
    } = req.body;

    // Lấy thông tin loại tên phòng và loại phòng
    const selectedRoomName = await RoomName.findByPk(roomNameId);
    if (!selectedRoomName) throw new Error("Vui lòng chọn tên phòng hợp lệ.");

    const roomType = await RoomType.findByPk(roomTypeId);
    if (!roomType) throw new Error("Không tìm thấy loại phòng đã chọn.");

    // Ảnh
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    const imagePaths = (req.files || [])
      .filter((f) => allowed.includes(f.mimetype))
      .map((f) => f.path.replace(/^public[\\/]/, ""));
    const imageString = imagePaths.join(";");

    // Địa chỉ
    let address = await Address.findOne({ where: { city, district, ward } });
    if (!address) {
      address = await Address.create(
        { city, district, ward },
        { transaction: t }
      );
    }

    const fullAddress = `${customAddress}, ${ward}, ${district}, ${city}`;

    // 1️⃣ Tạo phòng TRONG transaction
    const room = await Room.create(
      {
        roomNameId,
        roomName: selectedRoomName.roomName,
        fullAddress,
        capacity,
        availableRooms,
        price,
        description,
        image: imageString,
        providerId,
        addressId: address.addressId,
        roomTypeId,
        roomTypeName: roomType.typeName,
        status: "Hoạt động",
        approvalStatus: "Chờ duyệt",
        postedAt: new Date(),
      },
      { transaction: t }
    );

    console.log("🆕 Room ID mới tạo:", room.roomId);

    // 2️⃣ Commit transaction sớm — đảm bảo roomId đã có trong DB
    await t.commit();

    // 3️⃣ Sau commit, xử lý tiện ích
    let amenityList = Array.isArray(amenities) ? amenities : [amenities];
    amenityList = amenityList.filter((id) => id && !isNaN(id));

    if (amenityList.length > 0) {
      const validAmenities = await Amenity.findAll({
        where: { amenityId: amenityList },
        attributes: ["amenityId"],
      });

      const validIds = validAmenities.map((a) => a.amenityId);
      if (validIds.length > 0) {
        await room.setAmenities(validIds); // ✅ chạy ngoài transaction
        console.log(
          `✅ Gắn ${validIds.length} tiện ích cho phòng ${room.roomId}`
        );
      }
    }

    req.session.success = "✅ Phòng đã được thêm thành công!";
    res.redirect("/provider/dashboard");
  } catch (err) {
    if (!t.finished) await t.rollback();
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
      quantity: numRooms || "",
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
    const providerId = req.session.provider?.id;

    const room = await Room.findByPk(roomId, {
      include: [
        { model: Address, as: "Address" },
        { model: Amenity, as: "Amenities" },
        { model: RoomType, as: "RoomType" },
      ],
    });

    const providerInfo = await ProviderInfo.findOne({
      where: { providerId },
    });

    const roomTypes = await RoomType.findAll();
    const roomNames = await RoomName.findAll();

    const amenities = await Amenity.findAll({
      order: [
        ["category", "ASC"],
        ["amenityName", "ASC"],
      ],
    });

    const groupedAmenities = {};
    amenities.forEach((a) => {
      if (!groupedAmenities[a.category]) groupedAmenities[a.category] = [];
      groupedAmenities[a.category].push(a);
    });

    res.render("provider/edit-room", {
      room,
      providerInfo, // ⭐ thêm
      roomTypes,
      roomNames,
      groupedAmenities,
      error: {},
      success: null,
      form: {},
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải form chỉnh sửa phòng:", err);
    res.status(500).send("Lỗi khi tải form chỉnh sửa phòng.");
  }
};

// ===========================
// Cập nhật phòng
// ===========================
exports.updateRoom = async (req, res) => {
  console.log("🔧 validateEditRoom:", req.validationErrors);

  if (req.validationErrors && Object.keys(req.validationErrors).length > 0) {
    // ... (render lại form như bạn đang làm)
    return;
  }

  try {
    const roomId = req.params.roomId;
    const {
      roomNameId, // nếu dùng
      roomTypeId, // 🔹 lấy từ form
      capacity,
      price,
      description,
      customAddress,
      city,
      district,
      ward,
      amenities = [],
    } = req.body;

    // (Optional) kiểm tra roomType tồn tại
    if (!roomTypeId || isNaN(roomTypeId)) {
      throw new Error("Loại phòng không hợp lệ.");
    }

    // Ảnh mới (giữ nguyên logic cũ)
    let image = null;
    if (req.files?.length > 0) {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      const validImages = req.files
        .filter((f) => allowed.includes(f.mimetype))
        .map((f) => f.path.replace(/^public[\\/]/, ""));
      image = validImages.join(";");
    }

    // Địa chỉ (giữ nguyên)
    let address = await Address.findOne({ where: { city, district, ward } });
    if (!address) address = await Address.create({ city, district, ward });

    // 🔹 Cập nhật dữ liệu, NHỚ set roomTypeId
    const updateData = {
      capacity,
      price,
      description,
      fullAddress: `${customAddress}, ${ward}, ${district}, ${city}`,
      addressId: address.addressId,
      roomTypeId: Number(roomTypeId), // ✅ QUAN TRỌNG
      approvalStatus: "Chờ duyệt",
    };
    if (image) updateData.image = image;

    await Room.update(updateData, { where: { roomId } });

    // Log kiểm tra
    const updatedRoom = await Room.findByPk(roomId, {
      attributes: ["roomId", "roomTypeId"],
      include: [{ model: RoomType, as: "RoomType", attributes: ["typeName"] }],
    });
    console.log("✅ Room sau khi cập nhật:", {
      id: updatedRoom.roomId,
      roomTypeId: updatedRoom.roomTypeId,
      roomTypeName: updatedRoom.RoomType?.typeName,
    });

    // Tiện ích (giữ nguyên)
    const room = await Room.findByPk(roomId);
    let amenityList = Array.isArray(amenities) ? amenities : [amenities];
    if (amenityList.length > 0) await room.setAmenities(amenityList);

    req.session.success = "✅ Cập nhật thành công! Phòng sẽ được duyệt lại.";
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật phòng:", err);
    res.status(500).send("Lỗi khi cập nhật phòng: " + err.message);
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
      where: { approvalStatus: "Đã duyệt" },
      include: [
        {
          model: Address,
          as: "Address",
          attributes: ["city", "district", "ward"],
          where: whereAddress,
          required: !!city,
        },
        {
          model: Provider,
          as: "Provider",
          attributes: ["providerName"],
          required: false,
        },
        { model: Review, attributes: ["rating"], required: false },
      ],
      order: [["postedAt", "DESC"]],
    });

    const searchParams = { city, checkInDate, checkOutDate, numGuests };

    const [roomTypes] = await sequelize.query(`
      SELECT rt.roomTypeId, rt.typeName, COUNT(r.roomId) AS roomCount
      FROM RoomType rt
      JOIN Room r ON r.roomTypeId = rt.roomTypeId
      GROUP BY rt.roomTypeId, rt.typeName
      ORDER BY roomCount DESC
      LIMIT 8;
    `);

    res.render('list', { rooms, city, searchParams, roomTypes, filters: { typeIds: req.query.typeId, priceRange: parseInt(req.query.priceRange) || null, capacity: parseInt(req.query.capacity) || null, }, });
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách phòng:", err);
    res.status(500).send("Lỗi khi lấy danh sách phòng");
  }
};
//lấy phòng ưu đãi
exports.getWeekendDeals = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: [
        {
          model: Address,
          as: "Address",
          attributes: ["city", "district"],
          required: false,
        },
        { model: Review, attributes: ["rating"], required: false },
      ],
      limit: 4,
      order: sequelize.random(), // lấy ngẫu nhiên 4 phòng
    });

    // Tính rating trung bình và tạo giá giảm ảo
    const weekendDeals = rooms.map((room) => {
      const reviews = room.Reviews || [];
      const avgRating = reviews.length
        ? (
            reviews.reduce((a, r) => a + (r.rating || 0), 0) / reviews.length
          ).toFixed(1)
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

