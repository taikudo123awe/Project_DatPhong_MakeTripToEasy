const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Room = sequelize.define(
  "Room",
  {
    roomId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomNameId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "RoomName",
        key: "roomNameId",
      },
    },
    roomName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    fullAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    capacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    availableRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    totalRooms: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
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
      defaultValue: "Hoạt động",
    },
    approvalStatus: {
      type: DataTypes.STRING(30),
      defaultValue: "Chờ duyệt",
    },
    postedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Provider",
        key: "providerId",
      },
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Address",
        key: "addressId",
      },
    },
    roomTypeId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "RoomType",
        key: "roomTypeId",
      },
    },
  },
  {
    tableName: "Room",
    freezeTableName: true,
    timestamps: false,
  }
);

module.exports = Room;
