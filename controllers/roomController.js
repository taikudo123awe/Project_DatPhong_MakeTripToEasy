// controllers/roomController.js
const Room = require("../models/Room");
const Provider = require("../models/Provider");

// ===========================
// Lấy danh sách phòng cho trang /rooms
// ===========================
exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { approvalStatus: "Đã duyệt" },
      include: { model: Provider, as: "provider" }, // ✅ thêm alias
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
      include: { model: Provider, as: "provider" }, // ✅ thêm alias
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
// Hiển thị form thêm phòng (cho provider)
// ===========================
exports.showAddRoomForm = (req, res) => {
  res.render("provider/add-room", { error: null, success: null });
};

// ===========================
// Xử lý thêm phòng (Use Case NC04 - Đăng thông tin phòng)
// ===========================
exports.createRoom = async (req, res) => {
  try {
    console.log("📩 Dữ liệu form:", req.body);
    console.log("📷 File upload:", req.file);
    console.log("👤 Provider trong session:", req.session.provider);

    const providerId = req.session.provider?.providerId;
    if (!providerId) {
      throw new Error("Provider chưa đăng nhập hoặc session hết hạn.");
    }

    const { roomName, fullAddress, capacity, price, amenities, description } =
      req.body;
    const errors = [];

    // --- Kiểm tra hợp lệ dữ liệu ---
    const roomNameRegex = /^[a-zA-ZÀ-ỹ0-9\s]+$/;
    if (!roomName || roomName.trim() === "") {
      errors.push("Tên phòng không được để trống.");
    } else if (!roomNameRegex.test(roomName.trim())) {
      errors.push("Tên phòng không hợp lệ. Không được chứa ký tự đặc biệt.");
    }
    if (!fullAddress || fullAddress.trim() === "") {
      errors.push("Địa chỉ không được để trống.");
    }
    if (!capacity || isNaN(capacity) || capacity < 1) {
      errors.push("Số lượng người ở phải ≥ 1.");
    } else if (!Number.isInteger(Number(capacity))) {
      errors.push("Sức chứa phải là số nguyên.");
    }
    if (!price || isNaN(price) || price <= 0) {
      errors.push("Giá phòng phải là số > 0.");
    }
    if (!amenities || amenities.trim() === "") {
      errors.push("Vui lòng nhập tiện ích của phòng.");
    }
    if (!description || description.trim() === "") {
      errors.push("Vui lòng nhập mô tả phòng.");
    }

    // --- Kiểm tra ảnh ---
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

    // --- Nếu có lỗi, hiển thị lại form ---
    if (errors.length > 0) {
      console.warn("⚠️ Lỗi xác thực:", errors);
      return res.render("provider/add-room", {
        error: errors.join("<br>"),
        success: null,
      });
    }

    // --- Lưu dữ liệu hợp lệ vào CSDL ---
    const newRoom = await Room.create({
      roomName: roomName.trim(),
      fullAddress: fullAddress.trim(),
      capacity: parseInt(capacity),
      price: parseFloat(price),
      amenities: amenities.trim(),
      description: description.trim(),
      image: imagePath,
      providerId,
      status: "Phòng trống",
      approvalStatus: "Chờ duyệt",
      postedAt: new Date(),
    });

    console.log("✅ Phòng đã tạo:", newRoom.toJSON());
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi thêm phòng:", err.message, err.stack);
    res.status(500).send("Lỗi khi thêm phòng: " + err.message);
  }
};
// Hiển thị form sửa phòng
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

// sửa phòng
exports.updateRoom = async (req, res) => {
  try {
    const roomId = req.params.roomId;
    const { roomName, fullAddress, capacity, price, amenities, description } =
      req.body;

    // Nếu có ảnh mới thì lưu lại
    let image = null;
    if (req.files && req.files.length > 0) {
      image = req.files[0].path.replace("public\\", "").replace("public/", "");
    }

    // Khi cập nhật, chuyển trạng thái duyệt về "Chờ duyệt"
    const updateData = {
      roomName,
      fullAddress,
      capacity,
      price,
      amenities,
      description,
      approvalStatus: "Chờ duyệt", // ✅ cập nhật trạng thái duyệt
    };

    if (image) updateData.image = image;

    await Room.update(updateData, { where: { roomId } });

    console.log(
      `✅ Phòng ${roomId} đã được cập nhật, trạng thái chuyển về "Chờ duyệt"`
    );
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi cập nhật phòng:", err);
    res.status(500).send("Lỗi khi cập nhật phòng");
  }
};
// Xóa phòng
exports.deleteRoom = async (req, res) => {
  try {
    const { roomId } = req.params;

    // Kiểm tra phòng tồn tại
    const room = await Room.findByPk(roomId);
    if (!room) {
      req.session.error = "Không tìm thấy phòng cần xóa.";
      return res.redirect("/provider/dashboard");
    }

    // Chỉ cho phép xóa nếu là chủ phòng
    const providerId = req.session.provider?.providerId;
    if (room.providerId !== providerId) {
      req.session.error = "Bạn không có quyền xóa phòng này.";
      return res.redirect("/provider/dashboard");
    }

    // Thực hiện xóa
    await Room.destroy({ where: { roomId } });

    // Lưu thông báo vào session
    req.session.success = `Phòng "${room.roomName}" đã được xóa thành công.`;

    // Quay lại dashboard
    res.redirect("/provider/dashboard");
  } catch (err) {
    console.error("❌ Lỗi khi xóa phòng:", err);
    req.session.error = "Đã xảy ra lỗi khi xóa phòng. Vui lòng thử lại.";
    res.redirect("/provider/dashboard");
  }
};
