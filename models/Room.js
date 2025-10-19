// models/Room.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Provider = require("./Provider");
const Address = require("./Address"); // thêm import

const Room = sequelize.define(
  "Room",
  {
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
      type: DataTypes.STRING(255),
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
      references: {
        model: Provider,
        key: "providerId",
      },
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Address,
        key: "addressId",
      },
    },
  },
  {
    tableName: "Room",
    timestamps: false,
  }
);

// Thiết lập quan hệ
Room.belongsTo(Provider, { foreignKey: "providerId", as: "provider" });
Provider.hasMany(Room, { foreignKey: "providerId", as: "rooms" });

Room.belongsTo(Address, { foreignKey: "addressId", as: "address" });
Address.hasMany(Room, { foreignKey: "addressId", as: "rooms" });

module.exports = Room;
