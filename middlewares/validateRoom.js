// middlewares/validateRoom.js
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

function isNumber(value) {
  return !isNaN(value) && isFinite(value);
}
function sanitize(text) {
  return text?.trim() || "";
}
// Chỉ chữ cái (có dấu), khoảng trắng, ., -, '
const NAME_REGEX = /^[\p{L}\s'.-]+$/u;
exports.validateAddRoom = (req, res, next) => {
  req.validationErrors = null;

  const {
    roomNameId = "",
    customAddress = "",
    city = "",
    district = "",
    ward = "",
    capacity = "",
    price = "",
    description = "",
    roomTypeId = "",
    amenities = [],
  } = req.body;

  const errors = {};

  // 🔹 Kiểm tra lựa chọn tên phòng
  if (!roomNameId || isNaN(roomNameId)) {
    errors.roomNameId = "Vui lòng chọn tên phòng hợp lệ.";
  }

  // Địa chỉ
  if (!sanitize(customAddress))
    errors.customAddress = "Vui lòng nhập tên đường/số nhà.";
  if (!city) errors.city = "Vui lòng chọn thành phố.";
  if (!district) errors.district = "Vui lòng chọn quận/huyện.";
  if (!ward) errors.ward = "Vui lòng chọn phường/xã.";

  // Sức chứa & Giá
  if (!isNumber(Number(capacity)) || capacity < 1 || capacity > 50) {
    errors.capacity = "Sức chứa phải là số từ 1–50 người.";
  }
  if (!isNumber(Number(price)) || price <= 0 || price > 1e9) {
    errors.price = "Giá phòng phải là số hợp lệ (≤ 1,000,000,000 VND).";
  }

  // Loại phòng
  if (!roomTypeId || isNaN(roomTypeId)) {
    errors.roomTypeId = "Vui lòng chọn loại phòng hợp lệ.";
  }

  // Tiện ích
  const amenArr = Array.isArray(amenities)
    ? amenities
    : amenities
    ? [amenities]
    : [];
  if (amenArr.length === 0) {
    errors.amenities = "Vui lòng chọn ít nhất 1 tiện ích.";
  }

  // Mô tả
  const desc = sanitize(description);
  if (!desc) {
    errors.description = "Vui lòng nhập mô tả phòng.";
  } else if (desc.length < 20) {
    errors.description = "Mô tả phải có ít nhất 20 ký tự.";
  }

  // Ảnh
  if (!req.files || req.files.length === 0) {
    errors.image = "Vui lòng tải lên ít nhất 1 ảnh phòng.";
  } else if (req.files.length > MAX_IMAGES) {
    errors.image = `Tối đa ${MAX_IMAGES} ảnh được phép tải lên.`;
  } else {
    const invalid = req.files.filter(
      (f) => !ALLOWED_TYPES.includes(f.mimetype) || f.size > MAX_FILE_SIZE
    );
    if (invalid.length > 0) {
      errors.image =
        "Ảnh không hợp lệ (chỉ .jpg, .jpeg, .png; dung lượng ≤ 5MB).";
    }
  }

  if (Object.keys(errors).length > 0) {
    console.log("❌ Lỗi validateAddRoom:", errors);
    req.validationErrors = errors;
  } else {
    console.log("✅ Không có lỗi validateAddRoom");
  }
  next();
};

exports.validateEditRoom = (req, res, next) => {
  req.validationErrors = null;

  const {
    roomNameId = "",
    capacity = "",
    price = "",
    description = "",
  } = req.body;

  const errors = {};

  // Kiểm tra lựa chọn tên phòng
  if (!roomNameId || isNaN(roomNameId)) {
    errors.roomNameId = "Vui lòng chọn tên phòng hợp lệ.";
  }

  // Sức chứa
  if (!isNumber(Number(capacity)) || capacity < 1 || capacity > 50) {
    errors.capacity = "Sức chứa phải là số từ 1–50 người.";
  }

  // Giá
  if (!isNumber(Number(price)) || price <= 0 || price > 1e9) {
    errors.price = "Giá phòng phải là số hợp lệ (≤ 1,000,000,000 VND).";
  }

  // Mô tả
  const desc = sanitize(description);
  if (!desc) {
    errors.description = "Mô tả phòng không được để trống.";
  } else if (desc.length < 20) {
    errors.description = "Mô tả phải có ít nhất 20 ký tự.";
  }

  // Ảnh (chỉ kiểm tra nếu có upload)
  if (req.files?.length > 0) {
    if (req.files.length > MAX_IMAGES) {
      errors.image = `Chỉ được tải lên tối đa ${MAX_IMAGES} ảnh.`;
    } else {
      const invalid = req.files.filter(
        (f) => !ALLOWED_TYPES.includes(f.mimetype) || f.size > MAX_FILE_SIZE
      );
      if (invalid.length > 0) {
        errors.image =
          "Ảnh không hợp lệ (chỉ .jpg, .jpeg, .png; dung lượng ≤ 5MB).";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    req.validationErrors = errors;
  }

  next();
};
