// models/index.js
const Sequelize = require("sequelize");
const sequelize = require("../config/database");

// ✅ Import trực tiếp các model đã define sẵn
const Account = require("./Account");
const Admin = require("./Admin");
const Address = require("./Address");
const Booking = require("./Booking");
const Customer = require("./Customer");
const Feedback = require("./Feedback");
const Invoice = require("./Invoice");
const PaymentInfo = require("./PaymentInfo");
const Provider = require("./Provider");
const Review = require("./Review");
const Room = require("./Room");
const RoomType = require("./RoomType");

// ✅ Gọi associations nếu có
require("./associations")({
  Account,
  Admin,
  Address,
  Booking,
  Customer,
  Feedback,
  Invoice,
  PaymentInfo,
  Provider,
  Review,
  Room,
  RoomType,
  sequelize,
  Sequelize,
});

// ✅ Export ra để các file khác dùng
module.exports = {
  sequelize,
  Sequelize,
  Account,
  Admin,
  Address,
  Booking,
  Customer,
  Feedback,
  Invoice,
  PaymentInfo,
  Provider,
  Review,
  Room,
  RoomType,
};
