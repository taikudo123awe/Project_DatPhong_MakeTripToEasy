const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account'); // 👈 cần thêm để reference

const Admin = sequelize.define('Admin', {
  adminId: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  accountId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Account,
      key: 'accountId'
    }
  }
}, {
  tableName: 'Admin',
  timestamps: false
});

module.exports = Admin;
