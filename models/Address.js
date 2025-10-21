const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Address = sequelize.define(
  "Address",
  {
    addressId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    city: {
      type: DataTypes.STRING(58),
      allowNull: true,
    },
    district: {
      type: DataTypes.STRING(58),
      allowNull: true,
    },
    ward: {
      type: DataTypes.STRING(58),
      allowNull: true,
    },
  },
  {
    tableName: "Address",
    timestamps: false,
  }
);

// Liên kết


module.exports = Address;