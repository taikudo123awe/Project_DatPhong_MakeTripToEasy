const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Amenity = sequelize.define(
  "Amenity",
  {
    amenityId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    amenityName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category: {
      // ⭐ BẮT BUỘC PHẢI THÊM
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "General",
    },
  },
  {
    tableName: "Amenity",
    timestamps: false,
  }
);

module.exports = Amenity;
