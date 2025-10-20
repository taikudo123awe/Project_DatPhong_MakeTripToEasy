const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Account = require('./Account');
const Feedback = require('./Feedback');

const Provider = sequelize.define('Provider', {
  providerId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  providerName: {
    type: DataTypes.STRING(50), // Sửa lại đúng schema
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  phoneNumber: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  taxCode: {
    type: DataTypes.STRING(20) // Sửa lại đúng schema
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
  tableName: 'Provider',
  timestamps: false
});

// Quan hệ 1-1 với Account
Provider.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasOne(Provider, { foreignKey: 'accountId' });

module.exports = Provider;