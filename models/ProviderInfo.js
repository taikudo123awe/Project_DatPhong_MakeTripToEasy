const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProviderInfo = sequelize.define(
  "ProviderInfo",
  {
    infoId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    providerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    businessName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    addressId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Address",
        key: "addressId",
      },
    },
    businessAddress: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    popularAmenities: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    profileImage: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // BỔ SUNG CÁC CỘT BỊ NULL
    allowSmoking: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    allowChildren: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    allowEvents: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    petPolicy: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    checkinFrom: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    checkinTo: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    checkoutFrom: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    checkoutTo: {
      type: DataTypes.TIME,
      allowNull: true,
    },
  },
  {
    tableName: "ProviderInfo",
    timestamps: false,
  }
);

module.exports = ProviderInfo;
