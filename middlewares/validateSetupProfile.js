// middlewares/validateSetupProfile.js
const Amenity = require("../models/Amenity");

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

  // 🔹 Regex cho tên / địa chỉ: cho phép mọi chữ cái Unicode
  const nameRegex = /^[\p{L}0-9\s.,'-]+$/u;
  const addressRegex = /^[\p{L}0-9\s/.,'-]+$/u;

  // ======================
  // ⭐ Convert AM/PM (nếu có) → 24h
  // ======================
  function to24h(t) {
    if (!t) return "";

    // Trường hợp đã đúng dạng 24h -> giữ nguyên
    if (/^\d{2}:\d{2}$/.test(t)) return t;

    // 1) Chuẩn hóa chuỗi
    t = t.trim().toUpperCase();

    // 2) Tách modifier AM / PM
    let modifier = "";
    if (t.endsWith("AM")) modifier = "AM";
    if (t.endsWith("PM")) modifier = "PM";
    if (!modifier) return t; // Không phải AM/PM → trả lại

    // 3) Tách giờ phút
    let time = t.replace("AM", "").replace("PM", "").trim();
    let [hours, minutes] = time.split(":");
    hours = parseInt(hours);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${String(hours).padStart(2, "0")}:${minutes}`;
  }

  // ⭐ Convert trước validate
  const checkinFrom24 = to24h(checkinFrom);
  const checkinTo24 = to24h(checkinTo);
  const checkoutFrom24 = to24h(checkoutFrom);
  const checkoutTo24 = to24h(checkoutTo);

  // ⭐ Giữ lại giá trị khi render lại form
  req.body.checkinFrom = checkinFrom24;
  req.body.checkinTo = checkinTo24;
  req.body.checkoutFrom = checkoutFrom24;
  req.body.checkoutTo = checkoutTo24;

  // ======================
  // ⭐ Convert HH:mm → phút để compare chính xác
  // ======================
  function toMinutes(t) {
    if (!t || !/^\d{2}:\d{2}$/.test(t)) return NaN;
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  }

  // ======================
  // 🏢 TÊN DOANH NGHIỆP
  // ======================
  if (!businessName || !businessName.trim()) {
    errors.businessName = "Tên doanh nghiệp không được để trống.";
  } else if (businessName.trim().length < 3) {
    errors.businessName = "Tên doanh nghiệp phải có ít nhất 3 ký tự.";
  } else if (!nameRegex.test(businessName.trim())) {
    errors.businessName =
      "Tên doanh nghiệp không được chứa ký tự đặc biệt (chỉ chấp nhận chữ, số và . , ' -).";
  }

  // ======================
  // 🏠 ĐỊA CHỈ
  // ======================
  if (!customAddress || !customAddress.trim()) {
    errors.customAddress = "Vui lòng nhập tên đường / số nhà.";
  } else if (!addressRegex.test(customAddress.trim())) {
    errors.customAddress =
      "Địa chỉ không được chứa ký tự đặc biệt ngoài . , / ' -";
  }

  if (!city) errors.city = "Vui lòng chọn thành phố.";
  if (!district) errors.district = "Vui lòng chọn quận / huyện.";
  if (!ward) errors.ward = "Vui lòng chọn phường / xã.";

  // ======================
  // 📖 MÔ TẢ
  // ======================
  if (!description || !description.trim()) {
    errors.description = "Mô tả doanh nghiệp không được để trống.";
  } else if (description.trim().length < 50) {
    errors.description =
      "Mô tả quá ngắn. Vui lòng viết ít nhất 50 ký tự để mô tả rõ hơn.";
  }

  // ======================
  // 💎 TIỆN ÍCH
  // ======================
  // popularAmenities có thể là string (1 item) hoặc array hoặc undefined
  let normalizedAmenities = [];
  if (Array.isArray(popularAmenities)) {
    normalizedAmenities = popularAmenities;
  } else if (popularAmenities) {
    normalizedAmenities = [popularAmenities];
  }

  if (normalizedAmenities.length === 0) {
    errors.popularAmenities = "Vui lòng chọn ít nhất 1 tiện ích nổi bật.";
  }

  // ======================
  // ⏰ CHECKIN / CHECKOUT
  // ======================
  const isValidTime = (t) => /^\d{2}:\d{2}$/.test(t || "");

  // ⭐ CHECK-IN
  if (!isValidTime(checkinFrom24) || !isValidTime(checkinTo24)) {
    errors.checkin = "Vui lòng nhập giờ nhận phòng hợp lệ (hh:mm).";
  } else if (toMinutes(checkinFrom24) >= toMinutes(checkinTo24)) {
    errors.checkin = "Giờ nhận phòng (Từ) phải sớm hơn giờ (Đến).";
  }

  // ⭐ CHECK-OUT
  if (!isValidTime(checkoutFrom24) || !isValidTime(checkoutTo24)) {
    errors.checkout = "Vui lòng nhập giờ trả phòng hợp lệ (hh:mm).";
  } else if (toMinutes(checkoutFrom24) >= toMinutes(checkoutTo24)) {
    errors.checkout = "Giờ trả phòng (Từ) phải sớm hơn giờ (Đến).";
  }

  // ======================
  // ❌ Có lỗi → render lại form
  // ======================
  if (Object.keys(errors).length > 0) {
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

    // ⭐ Chọn đúng view theo URL: setup hay edit
    const view = req.originalUrl.includes("/profile/edit")
      ? "provider/edit-provider-info"
      : "provider/setup-profile";

    // ⭐ Nếu body KHÔNG có city/district/ward (do select bị disable chẳng hạn)
    //    thì fallback về địa chỉ cũ từ req.providerInfo (dành cho form edit)
    const oldAddr = req.providerInfo?.Address || {};
    const safeCity = city || oldAddr.city || "";
    const safeDistrict = district || oldAddr.district || "";
    const safeWard = ward || oldAddr.ward || "";

    return res.render(view, {
      provider: req.session.provider,
      providerInfo: req.providerInfo || null,
      groupedAmenities,
      errors,
      formData: {
        businessName: businessName || req.providerInfo?.businessName || "",
        city: safeCity,
        district: safeDistrict,
        ward: safeWard,
        customAddress:
          customAddress ||
          (req.providerInfo?.businessAddress
            ? req.providerInfo.businessAddress.split(",")[0].trim()
            : ""),
        description: description || req.providerInfo?.description || "",

        popularAmenities: normalizedAmenities,

        allowSmoking: req.body.allowSmoking ? 1 : 0,
        allowChildren: req.body.allowChildren ? 1 : 0,
        allowEvents: req.body.allowEvents ? 1 : 0,

        checkinFrom: checkinFrom24 || req.providerInfo?.checkinFrom || "",
        checkinTo: checkinTo24 || req.providerInfo?.checkinTo || "",
        checkoutFrom: checkoutFrom24 || req.providerInfo?.checkoutFrom || "",
        checkoutTo: checkoutTo24 || req.providerInfo?.checkoutTo || "",
      },
      error: null,
      success: null,
    });
  }

  // ======================
  // ✅ Không lỗi → next()
  // ======================
  next();
};
