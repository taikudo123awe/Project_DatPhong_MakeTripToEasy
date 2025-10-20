const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Account = sequelize.define('Account', {
  accountId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.INTEGER,
    allowNull: false
    // 0: admin, 1: provider, 2: customer
  },
  status: {
    type: DataTypes.STRING(20),
    defaultValue: 'active'
  }
}, {
  tableName: 'Account',
  timestamps: false
});

module.exports = Account;
