const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

function isNumber(value) {
  return !isNaN(value) && isFinite(value);
}

function sanitizeText(text) {
  return text?.trim() || "";
}

module.exports = {
  // =============================
  // 🏠 Validate thêm phòng mới
  // =============================
  validateAddRoom: (req, res, next) => {
    const {
      roomName = "",
      capacity = "",
      price = "",
      amenities = "",
      description = "",
      customAddress = "",
      city = "",
      district = "",
      ward = "",
    } = req.body;

    const errors = {};
    let hasMissing = false;

    // ============ Quy tắc ============
    // Cho phép chữ có dấu, số, khoảng trắng, -, ., ,, (), /
    const nameRegex = /^[\p{L}\p{N}\s\-\.,()\/]+$/u;
    // Địa chỉ: chữ có dấu, số, khoảng trắng và -, ., ,, /
    const addressRegex = /^[\p{L}\p{N}\s\-\.,\/]+$/u;
    // Tiện ích: danh sách ngăn bởi dấu phẩy, không có ký tự lạ
    const amenitiesRegex =
      /^[\p{L}\p{N}\s\-\./()]+(,\s*[\p{L}\p{N}\s\-\./()]+)*$/u;

    // Chuẩn hoá
    const trimmed = {
      roomName: roomName.trim(),
      customAddress: customAddress.trim(),
      amenities: amenities.trim(),
      description: description.trim(),
      city: String(city).trim(),
      district: String(district).trim(),
      ward: String(ward).trim(),
    };

    // -------- Kiểm tra thiếu chung --------
    const requiredMap = {
      roomName: "Vui lòng nhập tên phòng.",
      customAddress: "Vui lòng nhập tên đường/số nhà.",
      city: "Vui lòng chọn Thành phố.",
      district: "Vui lòng chọn Quận/Huyện.",
      ward: "Vui lòng chọn Phường/Xã.",
      capacity: "Vui lòng nhập sức chứa.",
      price: "Vui lòng nhập giá phòng.",
      amenities: "Vui lòng nhập tiện ích của phòng.",
      description: "Vui lòng nhập mô tả chi tiết về phòng.",
    };

    Object.entries(requiredMap).forEach(([field, msg]) => {
      const value =
        field === "capacity"
          ? capacity
          : field === "price"
          ? price
          : trimmed[field] ?? "";
      if (value === "" || value === null || value === undefined) {
        hasMissing = true;
        if (!errors[field]) errors[field] = msg;
      }
    });

    if (hasMissing) {
      errors._general = "Vui lòng nhập đầy đủ thông tin.";
    }

    // -------- Kiểm tra chi tiết từng trường --------
    // Tên phòng
    if (trimmed.roomName) {
      if (!nameRegex.test(trimmed.roomName)) {
        errors.roomName = "Tên phòng chứa ký tự không hợp lệ.";
      } else if (trimmed.roomName.length < 3 || trimmed.roomName.length > 100) {
        errors.roomName = "Tên phòng phải từ 3–100 ký tự.";
      }
    }

    // Địa chỉ
    if (trimmed.customAddress) {
      if (!addressRegex.test(trimmed.customAddress)) {
        errors.customAddress =
          "Địa chỉ chỉ được chứa chữ, số, khoảng trắng và -, ., , , /.";
      } else if (
        trimmed.customAddress.length < 3 ||
        trimmed.customAddress.length > 120
      ) {
        errors.customAddress = "Địa chỉ phải từ 3–120 ký tự.";
      }
    }

    // Sức chứa
    const cap = parseInt(capacity, 10);
    if (!Number.isNaN(cap)) {
      if (!Number.isInteger(cap) || cap < 1 || cap > 50) {
        errors.capacity = "Sức chứa phải là số nguyên từ 1–50.";
      }
    }

    // Giá phòng
    const pr = Number(price);
    if (!Number.isNaN(pr)) {
      if (!(pr > 0) || pr > 1e11) {
        errors.price = "Giá phòng phải > 0 và nhỏ hơn 100.000.000.000.";
      }
    }

    // Tiện ích
    if (trimmed.amenities) {
      if (trimmed.amenities.length > 255) {
        errors.amenities = "Tiện ích tối đa 255 ký tự.";
      } else if (!amenitiesRegex.test(trimmed.amenities)) {
        errors.amenities =
          "Tiện ích chỉ chứa chữ, số, khoảng trắng, -, ., /, () (ngăn cách bằng dấu phẩy).";
      }
    }

    // Mô tả
    if (trimmed.description) {
      if (trimmed.description.length < 20) {
        errors.description = "Mô tả phải có ít nhất 20 ký tự.";
      } else if (trimmed.description.length > 2000) {
        errors.description = "Mô tả tối đa 2000 ký tự.";
      }
    }

    // Ảnh
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length === 0) {
      errors.images = "Vui lòng tải lên ít nhất 1 ảnh phòng.";
    } else {
      if (files.length > 10) {
        errors.images = "Chỉ được tải tối đa 10 ảnh.";
      } else {
        for (const f of files) {
          if (!ALLOWED_TYPES.includes(f.mimetype)) {
            errors.images = "Chỉ chấp nhận ảnh .jpg, .jpeg, .png.";
            break;
          }
          if (f.size > MAX_FILE_SIZE) {
            errors.images = "Mỗi ảnh tối đa 5MB.";
            break;
          }
        }
      }
    }

    // -------- Nếu có lỗi -> render lại form --------
    if (Object.keys(errors).length > 0) {
      return res.status(400).render("provider/add-room", {
        error: null,
        errors,
        oldData: {
          roomName: trimmed.roomName,
          capacity,
          price,
          amenities: trimmed.amenities,
          description: trimmed.description,
          customAddress: trimmed.customAddress,
          city: trimmed.city,
          district: trimmed.district,
          ward: trimmed.ward,
        },
      });
    }

    next();
  },

  // 🛠️ Validate chỉnh sửa phòng
  validateEditRoom: (req, res, next) => {
    const {
      roomName = "",
      fullAddress = "",
      capacity = "",
      price = "",
      amenities = "",
      description = "",
      city = "",
      district = "",
      ward = "",
      customAddress = "",
    } = req.body;

    const errors = {};
    let hasMissing = false;

    // Quy tắc giống validateAddRoom
    const nameRegex = /^[\p{L}\p{N}\s\-\.,()\/]+$/u;
    const addressRegex = /^[\p{L}\p{N}\s\-\.,\/]+$/u;
    const amenitiesRegex =
      /^[\p{L}\p{N}\s\-\./()]+(,\s*[\p{L}\p{N}\s\-\./()]+)*$/u;

    const trimmed = {
      roomName: roomName.trim(),
      fullAddress: fullAddress.trim(),
      customAddress: customAddress.trim(),
      amenities: amenities.trim(),
      description: description.trim(),
    };

    // -------- Kiểm tra thiếu chung --------
    const requiredMap = {
      roomName: "Vui lòng nhập tên phòng.",
      fullAddress: "Vui lòng nhập hoặc chọn lại địa chỉ phòng.",
      capacity: "Vui lòng nhập sức chứa.",
      price: "Vui lòng nhập giá phòng.",
      amenities: "Vui lòng nhập tiện ích của phòng.",
      description: "Vui lòng nhập mô tả chi tiết về phòng.",
    };

    Object.entries(requiredMap).forEach(([field, msg]) => {
      const value =
        field === "capacity"
          ? capacity
          : field === "price"
          ? price
          : trimmed[field] ?? "";
      if (value === "" || value === null || value === undefined) {
        hasMissing = true;
        if (!errors[field]) errors[field] = msg;
      }
    });

    if (hasMissing) {
      errors._general = "Vui lòng nhập đầy đủ thông tin.";
    }

    // -------- Kiểm tra chi tiết --------
    // Tên phòng
    if (trimmed.roomName) {
      if (!nameRegex.test(trimmed.roomName)) {
        errors.roomName = "Tên phòng chứa ký tự không hợp lệ.";
      } else if (trimmed.roomName.length < 3 || trimmed.roomName.length > 100) {
        errors.roomName = "Tên phòng phải từ 3–100 ký tự.";
      }
    }

    // Địa chỉ
    if (trimmed.customAddress) {
      if (!addressRegex.test(trimmed.customAddress)) {
        errors.customAddress =
          "Địa chỉ chỉ chứa chữ, số, khoảng trắng và -, ., , , /.";
      } else if (
        trimmed.customAddress.length < 3 ||
        trimmed.customAddress.length > 120
      ) {
        errors.customAddress = "Địa chỉ phải từ 3–120 ký tự.";
      }
    }

    // Sức chứa
    const cap = parseInt(capacity, 10);
    if (!Number.isNaN(cap)) {
      if (!Number.isInteger(cap) || cap < 1 || cap > 50) {
        errors.capacity = "Sức chứa phải là số nguyên từ 1–50.";
      }
    }

    // Giá
    const pr = Number(price);
    if (!Number.isNaN(pr)) {
      if (!(pr > 0) || pr > 1e11) {
        errors.price = "Giá phòng phải > 0 và nhỏ hơn 100.000.000.000.";
      }
    }

    // Tiện ích
    if (trimmed.amenities) {
      if (trimmed.amenities.length > 255) {
        errors.amenities = "Tiện ích tối đa 255 ký tự.";
      } else if (!amenitiesRegex.test(trimmed.amenities)) {
        errors.amenities =
          "Tiện ích chỉ chứa chữ, số, khoảng trắng, -, ., /, () (ngăn cách bằng dấu phẩy).";
      }
    }

    // Mô tả
    if (trimmed.description) {
      if (trimmed.description.length < 20) {
        errors.description = "Mô tả phải có ít nhất 20 ký tự.";
      } else if (trimmed.description.length > 2000) {
        errors.description = "Mô tả tối đa 2000 ký tự.";
      }
    }

    // Ảnh upload
    if (req.files && req.files.length > 0) {
      if (req.files.length > 10) {
        errors.images = "Chỉ được tải tối đa 10 ảnh.";
      } else {
        req.files.forEach((file) => {
          if (!ALLOWED_TYPES.includes(file.mimetype)) {
            errors.images = `Ảnh "${file.originalname}" không hợp lệ.`;
          } else if (file.size > MAX_FILE_SIZE) {
            errors.images = `Ảnh "${file.originalname}" vượt quá 5MB.`;
          }
        });
      }
    }

    // ❌ Nếu có lỗi → render lại form sửa với dữ liệu cũ
    if (Object.keys(errors).length > 0) {
      const { roomId } = req.params;

      // Lấy lại dữ liệu phòng hiện tại để render
      const Room = require("../models/Room");
      const Address = require("../models/Address");

      return Room.findByPk(roomId, {
        include: [{ model: Address, as: "address" }],
      })
        .then((room) => {
          if (!room) {
            return res.redirect("/provider/dashboard");
          }
          res.status(400).render("provider/edit-room", {
            room,
            error: null,
            errors,
            oldData: {
              roomName: trimmed.roomName,
              capacity,
              price,
              amenities: trimmed.amenities,
              description: trimmed.description,
              customAddress: trimmed.customAddress,
              city,
              district,
              ward,
              fullAddress,
            },
          });
        })
        .catch((err) => {
          console.error("❌ Lỗi khi render lại form chỉnh sửa:", err);
          res.redirect("/provider/dashboard");
        });
    }

    next();
  },
};
