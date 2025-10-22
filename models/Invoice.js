const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Invoice = sequelize.define('Invoice', {

    invoiceId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    invoiceDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    amount: { type: DataTypes.FLOAT },
    status: {
        type: DataTypes.STRING(50),
        defaultValue: 'Chờ thanh toán'
    },
    customerId: { type: DataTypes.INTEGER, references: { model: 'Customer', key: 'customerId' } },
    bookingId: { type: DataTypes.INTEGER, references: { model: 'Booking', key: 'bookingId' } }
}, {
    tableName: 'Invoice',
    timestamps: false
});

module.exports = Invoice;
