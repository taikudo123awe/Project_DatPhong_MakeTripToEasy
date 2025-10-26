const Customer = require("../models/Customer");

module.exports = async (req, res, next) => {
  const { fullName, email, identityNumber } = req.body;
  const sessionCustomer = req.session.customer;

  // lấy từ DB bằng Sequelize
  const dbCustomer = await Customer.findByPk(sessionCustomer.customerId);

  if (!dbCustomer) {
    return res.redirect("/customer/profile");
  }

  // giữ phoneNumber từ DB cho chắc
  const customer = {
    ...dbCustomer.dataValues,
    fullName,
    email,
    identityNumber
  };

  // ======= validate =======
  if (!fullName || !email || !identityNumber) {
    return res.render("customer/update", {
      customer,
      error: "Vui lòng nhập đầy đủ thông tin",
      success: false
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
  if (!emailRegex.test(email)) {
    return res.render("customer/update", {
      customer,
      error: "Email không hợp lệ — chỉ chấp nhận @gmail.com",
      success: false
    });
  }

  const cccdRegex = /^[1-9]\d{11}$/;
  if (!cccdRegex.test(identityNumber)) {
    return res.render("customer/update", {
      customer,
      error: "CCCD phải gồm 12 số và không bắt đầu bằng 0",
      success: false
    });
  }

  next();
};
