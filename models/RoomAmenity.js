const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const RoomAmenity = sequelize.define(
  "RoomAmenity",
  {
    roomId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
    amenityId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
    },
  },
  {
    tableName: "RoomAmenity",
    timestamps: false,
  }
);

module.exports = RoomAmenity;
