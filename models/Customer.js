const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Customer = sequelize.define('Customer', {
  customerId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING(58),
    allowNull: false
  },
  identityNumber: {
    type: DataTypes.STRING(12),
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255)
  },
  phoneNumber: {
    type: DataTypes.STRING(15)
  },
  accountId: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Account',
      key: 'accountId'
    }
  }
}, {
  tableName: 'Customer',
  timestamps: false
});

module.exports = Customer;
