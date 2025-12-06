const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RoomType = sequelize.define(
  "RoomType",
  {
    roomTypeId: {
      // ✅ đổi lại cho trùng với DB
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    typeName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "RoomType",
    timestamps: false,
  }
);

module.exports = RoomType;
