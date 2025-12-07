module.exports = ({
  Account,
  Provider,
  ProviderInfo,
  Room,
  RoomType,
  Customer,
  Review,
  Feedback,
  Admin,
  Booking,
  Invoice,
  Address,
  RoomAmenity,
  RoomName,
  Amenity
}) => {
  // Customer <-> Account (1-1)
  Customer.belongsTo(Account, { foreignKey: "accountId" });
  Account.hasOne(Customer, { foreignKey: "accountId" });

  // Review <-> Customer (1-N)
  Review.belongsTo(Customer, { foreignKey: "customerId" });
  Customer.hasMany(Review, { foreignKey: "customerId" });

  // Review <-> Room (1-N)
  Review.belongsTo(Room, { foreignKey: "roomId" });
  Room.hasMany(Review, { foreignKey: "roomId" });

  // Feedback <-> Provider (1-N)
  Feedback.belongsTo(Provider, { foreignKey: "providerId" });
  Provider.hasMany(Feedback, { foreignKey: "providerId" });

  // Feedback <-> Review (1-1)
  Feedback.belongsTo(Review, { foreignKey: "reviewId" });
  Review.hasOne(Feedback, { foreignKey: "reviewId" });

  // Admin <-> Account (1-1)
  Admin.belongsTo(Account, { foreignKey: "accountId" });
  Account.hasOne(Admin, { foreignKey: "accountId" });

  // Customer <-> Booking (1-N)
  Booking.belongsTo(Customer, { foreignKey: "customerId", onDelete: "CASCADE", });
  Customer.hasMany(Booking, { foreignKey: "customerId", onDelete: "CASCADE", });

  // Room <-> Booking (1-N)
  Booking.belongsTo(Room, { foreignKey: "roomId", onDelete: "CASCADE" });
  Room.hasMany(Booking, { foreignKey: "roomId", onDelete: "CASCADE" });

  // Invoice <-> Booking (1-1)
  Invoice.belongsTo(Booking, { foreignKey: "bookingId", onDelete: "CASCADE", });
  Booking.hasOne(Invoice, { foreignKey: "bookingId", onDelete: "CASCADE", });

  // Invoice <-> Customer (N-1)
  Invoice.belongsTo(Customer, { foreignKey: "customerId", onDelete: "SET NULL", });
  Customer.hasMany(Invoice, { foreignKey: "customerId", onDelete: "SET NULL", });

  // Room <-> Provider (N-1)
  Room.belongsTo(Provider, { foreignKey: "providerId" });
  Provider.hasMany(Room, { foreignKey: "providerId" });

  // Room <-> Address (N-1)
  Room.belongsTo(Address, { foreignKey: "addressId" });
  Address.hasMany(Room, { foreignKey: "addressId" });

  // Room <-> RoomType (N-1)
  Room.belongsTo(RoomType, { foreignKey: "roomTypeId" });
  RoomType.hasMany(Room, { foreignKey: "roomTypeId" });

  // ==========================
  // 🔹 Provider & ProviderInfo
  // ==========================
  Provider.hasOne(ProviderInfo, { foreignKey: "providerId", as: "ProviderInfo", });
  ProviderInfo.belongsTo(Provider, { foreignKey: "providerId", as: "Provider", });
  ProviderInfo.belongsTo(Address, { foreignKey: "addressId", as: "Address", });
  Address.hasOne(ProviderInfo, { foreignKey: "addressId", as: "ProviderInfo", });

  Room.belongsTo(RoomName, { foreignKey: "roomNameId", as: "RoomName" });
  RoomName.hasMany(Room, { foreignKey: "roomNameId", as: "Rooms" });

  Room.belongsToMany(Amenity, { through: RoomAmenity, foreignKey: "roomId", otherKey: "amenityId", as: "Amenities", });
  Amenity.belongsToMany(Room, { through: RoomAmenity, foreignKey: "amenityId", otherKey: "roomId", as: "Rooms", });

  console.log("--- Các liên kết model (Associations) đã được định nghĩa ---");
};
