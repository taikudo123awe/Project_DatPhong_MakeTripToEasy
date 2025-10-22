module.exports = (req, res, next) => {
  try {
    const { cityName, districtName, wardName, dateRange, guests, rooms } = req.query;
    
    // Nếu không nhập gì → hiển thị tất cả phòng
    if (!cityName && !dateRange && !guests && !rooms) {
      return next();
    }

    // --- Kiểm tra chọn Thành phố / Quận / Phường ---
    if (!cityName || cityName.trim() === '') {
      return res.status(400).send('❌ Vui lòng chọn Thành phố.');
    }

    // --- Kiểm tra số người và số phòng ---
    const numGuests = parseInt(guests) || 1;
    const numRooms = parseInt(rooms) || 1;

    if (numGuests < 1 || numRooms < 1) {
      return res.status(400).send('❌ Số người và số phòng phải tối thiểu là 1.');
    }

    if (numRooms > numGuests) {
      return res.status(400).send('❌ Số phòng không được lớn hơn số người.');
    }

    // --- Hàm chuẩn hoá ngày: đổi "/" → "-" để new Date() không lỗi ---
    const normalizeDate = s => (s ? s.replace(/\//g, '-') : null);

    // --- Kiểm tra định dạng ngày ---
    let checkInDate = null, checkOutDate = null;
    if (dateRange) {
      const cleaned = dateRange.replace(/to|-/g, ' ').trim();
      const [startStr, endStr] = cleaned.split(/\s+/).filter(Boolean);
      if (startStr && endStr) {
        checkInDate  = new Date(normalizeDate(startStr));
        checkOutDate = new Date(normalizeDate(endStr));
        if (isNaN(checkInDate) || isNaN(checkOutDate) || checkInDate > checkOutDate) {
          return res.status(400).send('❌ Khoảng ngày không hợp lệ.');
        }
      }
    }

    // ✅ Gắn lại dữ liệu hợp lệ vào request để controller dùng
    req.validatedSearch = {
      city: (cityName || '').trim(),
      district: (districtName || '').trim(),
      ward: (wardName || '').trim(),
      checkInDate,
      checkOutDate,
      numGuests,
      numRooms
    };
    next();
  } catch (err) {
    console.error('❌ Lỗi validate tìm kiếm:', err);
    return res.status(500).send('Lỗi khi kiểm tra dữ liệu tìm kiếm.');
  }
};
