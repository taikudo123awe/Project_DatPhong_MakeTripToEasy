module.exports = (req, res, next) => {
  try {
    const { city, dateRange, guests, rooms } = req.query;

    // Nếu không nhập city hoặc dateRange thì vẫn cho phép hiển thị tất cả phòng
    if (!city && !dateRange && !guests && !rooms) return next();

    // ✅ Cho phép chữ, số, khoảng trắng, dấu chấm, phẩy, gạch ngang
    const cityRegex = /^[\p{L}\p{N}\s.,-]+$/u;
    if (city && !cityRegex.test(city.trim())) {
      return res.status(400).send('❌ Tên địa điểm không hợp lệ.');
    }

    // --- Kiểm tra số người và số phòng ---
    const numGuests = parseInt(guests) || 0;
    const numRooms = parseInt(rooms) || 0;

    if (numGuests < 1 || numRooms < 1) {
      return res.status(400).send('❌ Số người và số phòng phải tối thiểu là 1.');
    }

    if (numRooms > numGuests) {
      return res.status(400).send('❌ Số phòng không được lớn hơn số người.');
    }

    // --- Hàm chuẩn hoá ngày: đổi "/" → "-" để new Date() không lỗi ---
    const normalizeDate = (str) => {
      if (!str) return null;
      return str.replace(/\//g, "-");
    };

    // --- Kiểm tra định dạng ngày ---
    let startDate = null, endDate = null;
    if (dateRange) {
      const cleaned = dateRange.replace(/to|-/g, ' ').trim();
      const dates = cleaned.split(/\s+/).filter(Boolean);

      if (dates.length < 2) {
        return res.status(400).send('❌ Vui lòng chọn cả ngày nhận và trả phòng.');
      }

      const [startStr, endStr] = dates;
      startDate = new Date(normalizeDate(startStr));
      endDate = new Date(normalizeDate(endStr));

      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).send('❌ Ngày nhập không hợp lệ.');
      }

      if (startDate > endDate) {
        return res.status(400).send('❌ Ngày nhận phòng không được sau ngày trả phòng.');
      }
    }

    // ✅ Gắn lại dữ liệu hợp lệ vào request để controller dùng
    req.validatedSearch = {
      city: city ? city.trim() : '',
      checkInDate: startDate,
      checkOutDate: endDate,
      numGuests,
      numRooms
    };

    next();
  } catch (err) {
    console.error('❌ Lỗi validate tìm kiếm:', err);
    return res.status(500).send('Lỗi khi kiểm tra dữ liệu tìm kiếm.');
  }
};
