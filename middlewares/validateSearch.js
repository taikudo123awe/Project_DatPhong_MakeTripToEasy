module.exports = (req, res, next) => {
  try {
    const { cityName, districtName, wardName, dateRange, guests, rooms } = req.query;

    // Nếu không nhập gì thì cho xem tất cả phòng (không lỗi)
    if (!cityName && !dateRange && !guests && !rooms) {
      req.validatedSearch = {};
      return next();
    }

    // --- Xử lý số khách và số phòng ---
    const numGuests = parseInt(guests) || 1;
    const numRooms = parseInt(rooms) || 1;

    if (numGuests < 1 || numRooms < 1) {
      req.session.error = "❌ Số người và số phòng phải tối thiểu là 1.";
      return res.redirect("back");
    }

    if (numRooms > numGuests) {
      req.session.error = "❌ Số phòng không được lớn hơn số người.";
      return res.redirect("back");
    }

    // --- Xử lý ngày ---
    let checkInDate = null;
    let checkOutDate = null;

    if (dateRange && dateRange.includes(" to ")) {
      const [startStr, endStr] = dateRange.split(" to ");

      checkInDate = new Date(startStr.trim());
      checkOutDate = new Date(endStr.trim());

      if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate >= checkOutDate) {
        req.session.error = "❌ Khoảng ngày không hợp lệ.";
        return res.redirect("back");
      }
    }

    // --- KHÔNG bắt buộc thành phố ---
    // Nếu có thì trim, nếu không thì để chuỗi rỗng
    const city = (cityName || "").trim();
    const district = (districtName || "").trim();
    const ward = (wardName || "").trim();

    // Lưu vào request để controller dùng
    req.validatedSearch = {
      city,
      district,
      ward,
      checkInDate,
      checkOutDate,
      numGuests,
      numRooms,
    };

    next();
  } catch (err) {
    console.error("❌ Lỗi validate tìm kiếm:", err);
    req.session.error = "Lỗi khi kiểm tra dữ liệu tìm kiếm.";
    return res.redirect("back");
  }
};
