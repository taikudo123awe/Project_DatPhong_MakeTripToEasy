const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Provider = require("./Provider");
const Address = require("./Address");

const Room = sequelize.define("Room", {
  roomId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  roomName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  fullAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  capacity: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  amenities: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  image: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: "Hoạt động",
  },
  approvalStatus: {
    type: DataTypes.STRING(30),
    allowNull: true,
    defaultValue: "Chờ duyệt",
  },
  postedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  addressId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: "Room",
  timestamps: false,
});

module.exports = Room;
