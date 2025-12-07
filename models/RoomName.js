const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RoomName = sequelize.define(
  "RoomName",
  {
    roomNameId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    tableName: "RoomName",
    timestamps: false,
  }
);

module.exports = RoomName;
