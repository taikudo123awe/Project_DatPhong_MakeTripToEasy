// 📄 models/Provider.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Account = require("./Account");

const Provider = sequelize.define(
  "Provider",
  {
    providerId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    providerName: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    identityNumber: {
      type: DataTypes.STRING(12),
      allowNull: false,
      unique: true, // tránh trùng CCCD
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    taxCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    accountId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Account, //tham chiếu trực tiếp model thay vì string
        key: "accountId",
      },
    },
  },
  {
    tableName: "Provider",
    timestamps: false,
  }
);

// Thiết lập quan hệ 1-1 với Account
Provider.belongsTo(Account, {
  foreignKey: "accountId",
  as: "Account", // đặt alias để dễ include
});
Account.hasOne(Provider, {
  foreignKey: "accountId",
  as: "Provider",
});

module.exports = Provider;
