// models/Invoice.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {
  invoiceId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  invoiceDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }, // Sửa lại DATE cho khớp controller
  amount: { type: DataTypes.FLOAT },
  status: {
    type: DataTypes.STRING(50), // Khớp ERD
    defaultValue: 'Chờ thanh toán'
  },
  customerId: { type: DataTypes.INTEGER, references: { model: 'Customer', key: 'customerId' } },
  bookingId: { type: DataTypes.INTEGER, references: { model: 'Booking', key: 'bookingId' } }
}, {
  tableName: 'Invoice', // Tên bảng chữ hoa
  timestamps: false
});

module.exports = Invoice;