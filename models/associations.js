// 📄 models/associations.js

const Account = require("./Account");
const Provider = require("./Provider");
const ProviderInfo = require("./ProviderInfo");
const Room = require("./Room");
const RoomName = require("./RoomName");
const Customer = require("./Customer");
const Review = require("./Review");
const Feedback = require("./Feedback");
const Admin = require("./Admin");
const Booking = require("./Booking");
const Invoice = require("./Invoice");
const Address = require("./Address");
const Amenity = require("./Amenity");
const RoomType = require("./RoomType");
const RoomAmenity = require("./RoomAmenity");

// ==========================
// 🔹 Account & User Entities
// ==========================
Customer.belongsTo(Account, { foreignKey: "accountId" });
Account.hasOne(Customer, { foreignKey: "accountId" });

Admin.belongsTo(Account, { foreignKey: "accountId" });
Account.hasOne(Admin, { foreignKey: "accountId" });

// ==========================
// 🔹 Provider & ProviderInfo
// ==========================
Provider.hasOne(ProviderInfo, {
  foreignKey: "providerId",
});
ProviderInfo.belongsTo(Provider, {
  foreignKey: "providerId",
});
ProviderInfo.belongsTo(Address, {
  foreignKey: "addressId",
});
Address.hasOne(ProviderInfo, {
  foreignKey: "addressId",
});

// ==========================
// 🔹 Room & RoomName (mới)
// ==========================
Room.belongsTo(RoomName, { foreignKey: "roomNameId" });
RoomName.hasMany(Room, { foreignKey: "roomNameId" });

// ==========================
// 🔹 Room & RoomType
// ==========================
Room.belongsTo(RoomType, { foreignKey: "roomTypeId"});
RoomType.hasMany(Room, { foreignKey: "roomTypeId"});

// ==========================
// 🔹 Room & Address
// ==========================
Room.belongsTo(Address, { foreignKey: "addressId" });
Address.hasMany(Room, { foreignKey: "addressId"});

// ==========================
// 🔹 Room & Provider
// ==========================
Room.belongsTo(Provider, { foreignKey: "providerId" });
Provider.hasMany(Room, { foreignKey: "providerId" });

// ==========================
// 🔹 Room & Amenity (N-N)
// ==========================
Room.belongsToMany(Amenity, {
  through: RoomAmenity,
  foreignKey: "roomId",
  otherKey: "amenityId",
});
Amenity.belongsToMany(Room, {
  through: RoomAmenity,
  foreignKey: "amenityId",
  otherKey: "roomId",
});

// ==========================
// 🔹 Booking, Invoice, Review
// ==========================
Booking.belongsTo(Customer, { foreignKey: "customerId", onDelete: "CASCADE" });
Customer.hasMany(Booking, { foreignKey: "customerId", onDelete: "CASCADE" });

Booking.belongsTo(Room, { foreignKey: "roomId", onDelete: "CASCADE" });
Room.hasMany(Booking, { foreignKey: "roomId", onDelete: "CASCADE" });

Invoice.belongsTo(Booking, {
  foreignKey: "bookingId",
  onDelete: "CASCADE",
});
Booking.hasOne(Invoice, {
  foreignKey: "bookingId",
  onDelete: "CASCADE",
});

Invoice.belongsTo(Customer, { foreignKey: "customerId", onDelete: "SET NULL" });
Customer.hasMany(Invoice, { foreignKey: "customerId", onDelete: "SET NULL" });

Review.belongsTo(Customer, { foreignKey: "customerId" });
Customer.hasMany(Review, { foreignKey: "customerId" });

Review.belongsTo(Room, { foreignKey: "roomId" });
Room.hasMany(Review, { foreignKey: "roomId" });

Feedback.belongsTo(Provider, { foreignKey: "providerId" });
Provider.hasMany(Feedback, { foreignKey: "providerId" });

Feedback.belongsTo(Review, { foreignKey: "reviewId" });
Review.hasOne(Feedback, { foreignKey: "reviewId" });

console.log("--- ✅ Các liên kết model (Associations) đã được định nghĩa ---");
