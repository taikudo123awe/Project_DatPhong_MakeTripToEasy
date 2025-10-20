const Room = require("../models/Room");
const Provider = require("../models/Provider");

// ===========================
// Lấy danh sách phòng cho trang /rooms
// ===========================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "provider" },
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
// Thêm phòng (Form + Submit)
// ===========================
exports.showAddRoomForm = (req, res) => {
  res.render("provider/add-room", { error: null, success: null });
};

exports.createRoom = async (req, res) => {
  try {
    const providerId = req.session.provider?.id;
    if (!providerId) {
      throw new Error("Provider chưa đăng nhập hoặc session hết hạn.");
    }

    const { roomName, fullAddress, capacity, price, amenities, description } =
      req.body;
    const errors = [];

    if (!roomName || roomName.trim() === "")
      errors.push("Tên phòng không được để trống.");
    if (!fullAddress || fullAddress.trim() === "")
      errors.push("Địa chỉ không được để trống.");
    if (!capacity || isNaN(capacity) || capacity < 1)
      errors.push("Số lượng người ở phải ≥ 1.");
    if (!price || isNaN(price) || price <= 0)
      errors.push("Giá phòng phải là số > 0.");
    if (!amenities || amenities.trim() === "")
      errors.push("Vui lòng nhập tiện ích của phòng.");
    if (!description || description.trim() === "")
      errors.push("Vui lòng nhập mô tả phòng.");

    let imagePath = null;
    if (!req.file) {
      errors.push("Vui lòng tải lên ảnh phòng.");
    } else {
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        errors.push("Ảnh không đúng định dạng (.jpg, .jpeg, .png).");
      } else {
        imagePath = req.file.path
          .replace("public\\", "")
          .replace("public/", "");
      }
    }

    if (errors.length > 0) {
      return res.render("provider/add-room", {
        error: errors.join("<br>"),
        success: null,
      });
    }

    await Room.create({
      roomName,
      fullAddress,
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
      include: Provider,
    });

    if (!room) {
      return res.status(404).send("Không tìm thấy phòng");
    }

    res.render("rooms/detail", { room });
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi tải thông tin phòng");
  }
};

// ===========================
// Sửa phòng
// ===========================
exports.showEditRoomForm = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).send("Không tìm thấy phòng");
    res.render("provider/edit-room", { room, error: null });
  } catch (err) {
    console.error("❌ Lỗi load form:", err);
    res.status(500).send("Lỗi khi tải form sửa phòng");
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { roomName, fullAddress, capacity, price, amenities, description } =
      req.body;
    let image = null;
    if (req.files && req.files.length > 0) {
      image = req.files[0].path.replace("public\\", "").replace("public/", "");
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
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi cập nhật phòng:", err);
    res.status(500).send("Lỗi khi cập nhật phòng");
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
