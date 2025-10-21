// models/Customer.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account');

const Customer = sequelize.define('Customer', {
  customerId: { 
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true
  },
  fullName: {                           // 👈 thêm cột fullName
    type: DataTypes.STRING(100),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false 
  },
  identityNumber: {
    type: DataTypes.STRING(20),
    allowNull: false
  },
  accountId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    references: {
        model: 'Account',
        key: 'accountId'
    }
  }
}, {
  tableName: 'Customer',
  timestamps: false
});

// Quan hệ 1-1 với Account
Customer.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasOne(Customer,   { foreignKey: 'accountId' });

module.exports = Customer;
