const Sequelize = require("sequelize");
const sequelize = require("../config/database");

// Import models
const Account = require("./Account");
const Admin = require("./Admin");
const Address = require("./Address");
const Booking = require("./Booking");
const Customer = require("./Customer");
const Feedback = require("./Feedback");
const Invoice = require("./Invoice");
const PaymentInfo = require("./PaymentInfo");
const Provider = require("./Provider");
const ProviderInfo = require("./ProviderInfo");
const Review = require("./Review");
const Room = require("./Room");
const RoomType = require("./RoomType");
const Amenity = require("./Amenity");
const RoomAmenity = require("./RoomAmenity");
const RoomName = require("./RoomName");

// Gọi associations
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
  ProviderInfo,
  Review,
  Room,
  RoomType,
  Amenity,
  RoomAmenity,
  RoomName,
  Amenity,
  sequelize,
  Sequelize,
});

// Export
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
  ProviderInfo,
  Review,
  Room,
  RoomType,
  Amenity,
  RoomAmenity,
  RoomName,
  Amenity,
};
