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
      type: DataTypes.DATEONLY,
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Customer",
        key: "customerId",
      },
      onDelete: "CASCADE", // ✅ Xóa booking nếu customer bị xóa
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Room",
        key: "roomId",
      },
      onDelete: "CASCADE", // ✅ Xóa booking nếu room bị xóa
    },
  },
  {
    tableName: "Booking",
    timestamps: false,
  }
);

module.exports = Booking;
