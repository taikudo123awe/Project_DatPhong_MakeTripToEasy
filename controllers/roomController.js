const { Op } = require("sequelize");
const Room = require("../models/Room");
const Provider = require("../models/Provider");
const Booking = require("../models/Booking");
const Address = require("../models/Address");
const sequelize = require("../config/database");

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
      include: { model: Provider, as: "Provider" },
      order: [["postedAt", "DESC"]],
      limit: 8,
    });
    res.render("home", { rooms });
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

  try {
    const room = await Room.findOne({
      where: { roomId, approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "Provider" },
    });

    if (!room) return res.status(404).send("Không tìm thấy phòng.");

    res.render("rooms/detail", { room });
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

//Tìm kiếm phòng
exports.searchRooms = async (req, res) => {
  try {
    const validated = req.validatedSearch || {};
    const city = validated.city || '';
    const district = validated.district || '';
    const ward = validated.ward || '';
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
            ...(city
              ? sequelize.where(
                sequelize.fn("LOWER", sequelize.col("address.city")),
                {
                  [Op.like]: `%${city.toLowerCase()}%`,
                }
              )
              : {}),
            ...(district
              ? sequelize.where(
                sequelize.fn("LOWER", sequelize.col("address.district")),
                {
                  [Op.like]: `%${district.toLowerCase()}%`,
                }
              )
              : {}),
            ...(ward
              ? sequelize.where(
                sequelize.fn("LOWER", sequelize.col("address.ward")),
                {
                  [Op.like]: `%${ward.toLowerCase()}%`,
                }
              )
              : {}),
          },
          attributes: ["city", "district", "ward"],
        }
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
            ? `${checkInDate.toISOString().slice(0, 10)} to ${checkOutDate.toISOString().slice(0, 10)}`
            : null
      });
    }

    // B4: Render danh sách phòng
    res.render('list', {
      rooms: availableRooms,
      keyword: city || district || ward,
      dateRange:
        checkInDate && checkOutDate
          ? `${checkInDate.toISOString().slice(0, 10)} to ${checkOutDate.toISOString().slice(0, 10)}`
          : null
    });
  } catch (err) {
    console.error("❌ Lỗi khi tìm kiếm phòng:", err);
    res.status(500).send("Lỗi khi tìm kiếm phòng.");
  }
};
