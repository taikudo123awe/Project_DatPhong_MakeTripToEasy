const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provider = require('./Provider'); // Import Provider

const PaymentInfo = sequelize.define('PaymentInfo', {
  paymentInfoId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  bankName: {
    type: DataTypes.STRING(50),
    allowNull: true 
  },
  accountHolder: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  accountNumber: {
    type: DataTypes.STRING(15),
    allowNull: true
  },
  qrCode: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Provider',
      key: 'providerId'
    }
  }
}, {
  tableName: 'paymentinfo', // Đặt tên bảng chữ thường cho nhất quán
  timestamps: false
});

// Định nghĩa quan hệ (giống pattern của Room.js)
PaymentInfo.belongsTo(Provider, { foreignKey: 'providerId' });
Provider.hasMany(PaymentInfo, { foreignKey: 'providerId' });

module.exports = PaymentInfo;