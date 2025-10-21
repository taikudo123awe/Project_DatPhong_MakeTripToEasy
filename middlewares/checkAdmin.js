module.exports.isAdmin = (req, res, next) => {
  try {
    // Kiểm tra xem admin đã đăng nhập chưa
    if (!req.session.admin) {
      console.log('❌ Chưa đăng nhập với tư cách admin!');
      return res.redirect('/admin/login');
    }

    // Nếu có session admin -> cho phép đi tiếp
    console.log(`✅ Admin đăng nhập: ${req.session.admin.username}`);
    next();
  } catch (error) {
    console.error('❌ Lỗi trong middleware checkAdmin:', error);
    res.status(500).send('Lỗi xác thực quản trị viên');
  }
};
