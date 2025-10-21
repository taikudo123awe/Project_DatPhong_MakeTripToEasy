// models/Booking.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Room = require("./Room");
const Customer = require("./Customer");

const Booking = sequelize.define(
  "Booking",
  {
    bookingId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    bookingDate: {
      type: DataTypes.DATEONLY, // ✅ vì trong DB là kiểu DATE
      allowNull: true,
    },
    checkInDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    checkOutDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    numberOfGuests: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Customer",
        key: "customerId",
      },
    },
    roomId: {
      type: DataTypes.INTEGER,
      references: {
        model: "Room",
        key: "roomId",
      },
    },
  },
  {
    tableName: "Booking",
    timestamps: false,
  }
);

// ================== Associations ==================
Booking.belongsTo(Room, { foreignKey: "roomId", as: "room" });
Booking.belongsTo(Customer, { foreignKey: "customerId", as: "customer" });

module.exports = Booking;