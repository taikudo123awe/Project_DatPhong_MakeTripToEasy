const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Định nghĩa model Address
const Address = sequelize.define(
  "Address",
  {
    addressId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    city: DataTypes.STRING,
    district: DataTypes.STRING,
    ward: DataTypes.STRING,
  },
  {
    tableName: "Address",
    timestamps: false,
  }
);

module.exports = Address;
