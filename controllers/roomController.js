const { Op } = require("sequelize");
const Room = require("../models/Room");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const Address = require("../models/Address");
const sequelize = require("../config/database");
const Review = require("../models/Review");
const Customer = require("../models/Customer");
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "Provider" },
      order: [["postedAt", "DESC"]],
    });
    res.render("rooms/list", { rooms });
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
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: [
        { model: Provider, as: "Provider" },
        { model: Review }, // thêm đánh giá
      ],
      order: [["postedAt", "DESC"]],
      limit: 8,
    });

    // ✅ Tính trung bình sao và số lượt đánh giá cho mỗi phòng
    const roomsWithRating = rooms.map((room) => {
      const reviews = room.Reviews || [];
      const reviewCount = reviews.length;
      const avgRating =
        reviewCount > 0
          ? (
              reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
            ).toFixed(1)
          : null;
      return {
        ...room.toJSON(),
        avgRating,
        reviewCount,
      };
    });

    res.render("home", { rooms: roomsWithRating });
  } catch (err) {
    console.error("❌ Lỗi khi tải trang chủ:", err);
    res.status(500).send("Lỗi khi tải trang chủ");
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

    const error = req.session.error || null;
    delete req.session.error;

    res.render("provider/add-room", {
      error,
      success: null,
      addresses,
      errors: {}, // ✅ thêm dòng này
      oldData: {}, // ✅ thêm dòng này
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải form thêm phòng:", err);
    res.status(500).send("Lỗi khi tải form thêm phòng");
  }
};
// Thêm phòng mới
exports.createRoom = async (req, res) => {
  try {
    const providerId = req.session.provider?.id;
    if (!providerId)
      throw new Error("Provider chưa đăng nhập hoặc session hết hạn.");

    const {
      roomName,
      customAddress,
      city,
      district,
      ward,
      capacity,
      price,
      amenities,
      description,
    } = req.body;

    // ✅ Ảnh đã được validate, chỉ cần xử lý lưu
    const imagePaths = req.files.map((file) =>
      file.path.replace(/^public[\\/]/, "")
    );

    // Tạo hoặc lấy Address
    let address = await Address.findOne({ where: { city, district, ward } });
    if (!address) address = await Address.create({ city, district, ward });

    const fullAddress = `${customAddress}, ${ward}, ${district}, ${city}`;

    await Room.create({
      roomName,
      fullAddress,
      addressId: address.addressId,
      capacity,
      price,
      amenities,
      description,
      image: imagePaths.join(";"),
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
// Chi tiết phòng
exports.getRoomDetail = async (req, res) => {
  const roomId = req.params.roomId;
  const { checkInDate, checkOutDate, numberOfGuests } = req.query;

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
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải thông tin phòng:", err);
    res.status(500).send("Lỗi khi tải thông tin phòng");
  }
};

// Hiển thị form chỉnh sửa
exports.showEditRoomForm = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    // ⚙️ Lấy phòng kèm Address
    const room = await Room.findByPk(roomId, {
      include: [{ model: Address, as: "address" }],
    });

    if (!room) return res.status(404).send("Không tìm thấy phòng.");

    res.render("provider/edit-room", {
      room,
      errors: {}, // ✅ thêm dòng này
      oldData: {}, // ✅ thêm dòng này
      error: null,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tải form chỉnh sửa:", err);
    res.status(500).send("Lỗi khi tải form chỉnh sửa phòng.");
  }
};

// Cập nhật phòng
exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const {
      roomName,
      city,
      district,
      ward,
      customAddress,
      fullAddress,
      capacity,
      price,
      amenities,
      description,
    } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room) {
      req.session.error = "Không tìm thấy phòng.";
      return res.redirect("/provider/dashboard");
    }

    // 🟢 Thêm đoạn xử lý Address ở đây:
    let addressId = room.addressId; // giữ mặc định cũ
    if (city && district && ward) {
      let address = await Address.findOne({ where: { city, district, ward } });
      if (!address) {
        address = await Address.create({ city, district, ward });
      }
      addressId = address.addressId;
    }

    const newFullAddress = customAddress
      ? `${customAddress}, ${ward}, ${district}, ${city}`
      : fullAddress;

    // Ảnh mới (nếu có)
    let image = null;
    if (req.files?.length > 0) {
      const allowed = ["image/jpeg", "image/png", "image/jpg"];
      image = req.files
        .filter((f) => allowed.includes(f.mimetype))
        .map((f) => f.path.replace(/^public[\\/]/, ""))
        .join(";");
    }

    // Trạng thái duyệt
    let approvalStatus = room.approvalStatus;
    if (room.approvalStatus === "Đã duyệt") approvalStatus = "Chờ duyệt";

    await Room.update(
      {
        roomName,
        fullAddress: newFullAddress,
        addressId, // ✅ cập nhật addressId mới
        capacity,
        price,
        amenities,
        description,
        approvalStatus,
        ...(image && { image }),
      },
      { where: { roomId } }
    );

    req.session.success =
      approvalStatus === "Chờ duyệt"
        ? "✅ Phòng đã được cập nhật và chuyển lại trạng thái 'Chờ duyệt'."
        : "✅ Phòng đã được cập nhật.";
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật phòng:", err);
    req.session.error = "Đã xảy ra lỗi khi cập nhật phòng.";
    res.redirect("/provider/dashboard");
  }
};
// Xóa (ẩn) phòng — soft delete
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

//Tìm kiếm phòng
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

    // B1: Tìm danh sách phòng đã bị đặt trùng khoảng ngày
    let bookedRoomIds = [];
    if (checkInDate && checkOutDate) {
      const overlappingBookings = await Booking.findAll({
        where: {
          [Op.and]: [
            { checkInDate: { [Op.lt]: checkOutDate } },
            { checkOutDate: { [Op.gt]: checkInDate } },
            { status: { [Op.ne]: "Đã hủy" } }, // Chỉ lấy các booking chưa hủy
          ],
        },
        attributes: ["roomId"],
      });
      bookedRoomIds = overlappingBookings.map((b) => b.roomId);
    }

    // B2: Lấy danh sách phòng trống
    const availableRooms = await Room.findAll({
      where: {
        [Op.and]: [
          bookedRoomIds.length > 0
            ? { roomId: { [Op.notIn]: bookedRoomIds } }
            : {},
          { approvalStatus: "Đã duyệt" },
          { status: "Hoạt động" },
          { capacity: { [Op.gte]: numGuests } }, // chỉ lấy phòng có đủ sức chứa
        ],
      },
      include: [
        {
          model: Address,
          as: "address",
          where: {
            [Op.and]: [
              city
                ? sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("address.city")),
                    { [Op.like]: `%${city.toLowerCase()}%` }
                  )
                : null,
              district
                ? sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("address.district")),
                    { [Op.like]: `%${district.toLowerCase()}%` }
                  )
                : null,
              ward
                ? sequelize.where(
                    sequelize.fn("LOWER", sequelize.col("address.ward")),
                    { [Op.like]: `%${ward.toLowerCase()}%` }
                  )
                : null,
            ].filter(Boolean), // lọc null để tránh lỗi
          },
          attributes: ["city", "district", "ward"],
        },
      ],

      order: [["postedAt", "DESC"]],
    });

    // B3: Nếu không có phòng phù hợp
    if (!availableRooms || availableRooms.length === 0) {
      return res.render("list", {
        rooms: [],
        keyword: city || district || ward,
        dateRange:
          checkInDate && checkOutDate
            ? `${checkInDate.toISOString().slice(0, 10)} to ${checkOutDate
                .toISOString()
                .slice(0, 10)}`
            : null,
      });
    }

    console.log("✅ searchParams:", {
      checkInDate,
      checkOutDate,
      numGuests,
      numRooms,
    });

    //lưu dữ liệu tìm kiếm
    // Truyền thêm thông tin tìm kiếm để hiển thị / dùng lại ở trang đặt phòng
    const searchParams = {
      checkInDate: checkInDate ? checkInDate.toISOString().slice(0, 10) : "",
      checkOutDate: checkOutDate ? checkOutDate.toISOString().slice(0, 10) : "",
      numGuests,
      numRooms,
    };

    // B4: Render danh sách phòng
    res.render("list", {
      rooms: availableRooms,
      keyword: city || district || ward,
      dateRange:
        checkInDate && checkOutDate
          ? `${checkInDate.toISOString().slice(0, 10)} to ${checkOutDate
              .toISOString()
              .slice(0, 10)}`
          : null,
      searchParams,
    });
  } catch (err) {
    console.error("❌ Lỗi khi tìm kiếm phòng:", err);
    res.status(500).send("Lỗi khi tìm kiếm phòng.");
  }
};
