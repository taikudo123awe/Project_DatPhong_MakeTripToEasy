const Room = require("../models/Room");
const Provider = require("../models/Provider");
const Address = require("../models/Address");
// ===========================
// Lấy danh sách phòng cho trang /rooms
// ===========================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "provider" },
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
      include: { model: Provider, as: "provider" },
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
      addresses,
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
    if (!providerId) {
      throw new Error("Provider chưa đăng nhập hoặc session đã hết hạn.");
    }

    const {
      roomName,
      customAddress,
      addressId,
      capacity,
      price,
      amenities,
      description,
    } = req.body;

    console.log("📦 Dữ liệu nhận từ form:", req.body); // <== debug

    const errors = [];

    // Validate
    if (!roomName?.trim()) errors.push("Tên phòng không được để trống.");
    if (!addressId) errors.push("Vui lòng chọn địa chỉ khu vực.");
    if (!customAddress?.trim()) errors.push("Vui lòng nhập tên đường/số nhà.");
    if (!capacity || isNaN(capacity) || capacity < 1)
      errors.push("Sức chứa phải ≥ 1.");
    if (!price || isNaN(price) || price <= 0)
      errors.push("Giá phòng phải là số > 0.");
    if (!amenities?.trim()) errors.push("Nhập tiện ích phòng.");
    if (!description?.trim()) errors.push("Nhập mô tả phòng.");

    let imagePath = null;
    if (!req.file) {
      errors.push("Vui lòng tải lên ảnh phòng.");
    } else {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        errors.push("Ảnh không đúng định dạng (.jpg, .jpeg, .png).");
      } else {
        imagePath = req.file.path.replace(/^public[\\/]/, "");
      }
    }

    if (errors.length > 0) {
      const addresses = await Address.findAll();
      return res.render("provider/add-room", {
        error: errors.join("<br>"),
        success: null,
        addresses,
      });
    }

    // Lấy địa chỉ đầy đủ từ DB
    const addr = await Address.findByPk(addressId);
    if (!addr) throw new Error("Không tìm thấy địa chỉ trong hệ thống.");

    const fullAddress = `${customAddress}, ${addr.ward}, ${addr.district}, ${addr.city}`;

    await Room.create({
      roomName,
      fullAddress,
      addressId,
      capacity,
      price,
      amenities,
      description,
      image: imagePath,
      providerId,
      status: "Phòng trống",
      approvalStatus: "Chờ duyệt",
      postedAt: new Date(),
    });

    req.session.success = "✅ Phòng đã được thêm thành công!";
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi thêm phòng:", err);
    res.status(500).send("Lỗi khi thêm phòng");
  }
};

// ===========================
// Chi tiết phòng
// ===========================
exports.getRoomDetail = async (req, res) => {
  const roomId = req.params.id;

  try {
    const room = await Room.findOne({
      where: { roomId, approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "provider" }, // ✅ alias đồng bộ
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
      image = req.files[0].path.replace(/^public[\\/]/, "");
    }

    const updateData = {
      roomName,
      fullAddress,
      capacity,
      price,
      amenities,
      description,
      approvalStatus: "Chờ duyệt",
    };
    if (image) updateData.image = image;

    await Room.update(updateData, { where: { roomId } });
    req.session.success = "Cập nhật phòng thành công!";
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật phòng:", err);
    req.session.error = "Đã xảy ra lỗi khi cập nhật phòng.";
    res.redirect("/provider/dashboard");
  }
};

// ===========================
// Xóa phòng
// ===========================
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await Room.findByPk(roomId);

    if (!room) {
      req.session.error = "Không tìm thấy phòng cần xóa.";
      return res.redirect("/provider/dashboard");
    }

    const providerId = req.session.provider?.id;
    if (room.providerId !== providerId) {
      req.session.error = "Bạn không có quyền xóa phòng này.";
      return res.redirect("/provider/dashboard");
    }

    await Room.destroy({ where: { roomId } });
    req.session.success = `Phòng "${room.roomName}" đã được xóa thành công.`;
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi xóa phòng:", err);
    req.session.error = "Đã xảy ra lỗi khi xóa phòng. Vui lòng thử lại.";
    res.redirect("/provider/dashboard");
  }
};
