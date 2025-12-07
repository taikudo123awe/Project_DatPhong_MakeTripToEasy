// middlewares/validateEditProviderInfo.js

const ProviderInfo = require("../models/ProviderInfo");
const Address = require("../models/Address");
const Amenity = require("../models/Amenity");

// Giải mã HTML entities (&amp; → &)
const decodeEntities = (str) => {
  if (!str) return "";
  return str.replace(/&[^\s;]+;/g, "&");
};

module.exports = async (req, res, next) => {
  const errors = {};
  const {
    businessName,
    customAddress,
    city,
    district,
    ward,
    description,
    popularAmenities,
    checkinFrom,
    checkinTo,
    checkoutFrom,
    checkoutTo,
  } = req.body;

  // Load ProviderInfo cũ
  const providerId = req.session.provider?.id;

  req.providerInfo = await ProviderInfo.findOne({
    where: { providerId },
    include: [{ model: Address, as: "Address" }],
  });

  // Load Amenities
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

  req.groupedAmenities = groupedAmenities;

  // Giải mã entities trước khi validate
  const decodedName = decodeEntities(businessName);
  const decodedAddress = decodeEntities(customAddress);

  // Regex tiếng Việt chuẩn (không cho ký tự đặc biệt)
  const nameRegex = /^[A-Za-zÀ-ỹ0-9\s.,'-]+$/;
  const addressRegex = /^[A-Za-zÀ-ỹ0-9\s/.,'-]+$/;

  // TÊN DOANH NGHIỆP
  if (!decodedName || decodedName.trim().length < 3)
    errors.businessName = "Tên doanh nghiệp phải có ít nhất 3 ký tự.";
  else if (!nameRegex.test(decodedName.trim()))
    errors.businessName = "Tên doanh nghiệp không được chứa ký tự đặc biệt.";

  // ĐỊA CHỈ
  if (!decodedAddress)
    errors.customAddress = "Vui lòng nhập tên đường / số nhà.";
  else if (!addressRegex.test(decodedAddress))
    errors.customAddress = "Địa chỉ không được chứa ký tự đặc biệt.";

  if (!city) errors.city = "Vui lòng chọn thành phố.";
  if (!district) errors.district = "Vui lòng chọn quận / huyện.";
  if (!ward) errors.ward = "Vui lòng chọn phường / xã.";

  // MÔ TẢ
  if (!description || description.trim().length < 50)
    errors.description = "Mô tả phải có ít nhất 50 ký tự.";

  // TIỆN ÍCH
  let normalizedAmenities = Array.isArray(popularAmenities)
    ? popularAmenities
    : popularAmenities
    ? [popularAmenities]
    : [];

  if (normalizedAmenities.length === 0)
    errors.popularAmenities = "Vui lòng chọn ít nhất 1 tiện ích.";

  // CHECKIN - CHECKOUT
  const normalizeTime = (t) => {
    if (!t) return "";
    t = String(t).trim();

    // Tách phần AM/PM nếu có
    let meridiem = null;
    let timePart = t;

    // Ví dụ: "01:00 PM" hoặc "1:00 pm"
    const ampmMatch = t.match(/(AM|PM)$/i);
    if (ampmMatch) {
      meridiem = ampmMatch[1].toUpperCase();
      timePart = t.replace(/(AM|PM)$/i, "").trim(); // còn lại "01:00" hoặc "1:00"
    }

    // Tách giờ/phút
    const parts = timePart.split(":");
    if (parts.length < 2) return "";

    let h = parseInt(parts[0], 10);
    let m = parseInt(parts[1], 10);

    if (Number.isNaN(h) || Number.isNaN(m)) return "";
    if (h < 0 || h > 23 || m < 0 || m > 59) return "";

    // Nếu có AM/PM → convert về 24h
    if (meridiem) {
      if (meridiem === "PM" && h !== 12) h += 12;
      if (meridiem === "AM" && h === 12) h = 0;
    }

    // Trả về "HH:MM" chuẩn
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const toMin = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const cIn1 = normalizeTime(checkinFrom);
  const cIn2 = normalizeTime(checkinTo);
  const cOut1 = normalizeTime(checkoutFrom);
  const cOut2 = normalizeTime(checkoutTo);

  if (!cIn1 || !cIn2 || toMin(cIn1) >= toMin(cIn2)) {
    errors.checkin = "Giờ nhận phòng không hợp lệ. (Từ phải nhỏ hơn Đến)";
  }

  if (!cOut1 || !cOut2 || toMin(cOut1) >= toMin(cOut2)) {
    errors.checkout = "Giờ trả phòng không hợp lệ. (Từ phải nhỏ hơn Đến)";
  }

  if (Object.keys(errors).length > 0) {
    const oldAddr = req.providerInfo?.Address || {};
    let failedStep = 1;

    if (errors.businessName) failedStep = 1;
    else if (
      errors.city ||
      errors.district ||
      errors.ward ||
      errors.customAddress
    )
      failedStep = 2;
    else if (errors.description) failedStep = 3;
    else if (errors.popularAmenities) failedStep = 4;
    else if (errors.checkin || errors.checkout) failedStep = 6;

    return res.render("provider/edit-provider-info", {
      provider: req.session.provider,
      providerInfo: req.providerInfo,
      groupedAmenities,
      errors,
      failedStep,
      // GIỮ LẠI GIÁ TRỊ USER ĐÃ NHẬP
      formData: {
        businessName: decodedName,
        customAddress: decodedAddress,
        city: city || oldAddr.city || "",
        district: district || oldAddr.district || "",
        ward: ward || oldAddr.ward || "",
        description,
        popularAmenities: normalizedAmenities,
        allowSmoking: req.body.allowSmoking ? 1 : 0,
        allowChildren: req.body.allowChildren ? 1 : 0,
        allowEvents: req.body.allowEvents ? 1 : 0,
        checkinFrom: cIn1,
        checkinTo: cIn2,
        checkoutFrom: cOut1,
        checkoutTo: cOut2,
      },

      success: null,
      error: null,
    });
  }
  next();
};
