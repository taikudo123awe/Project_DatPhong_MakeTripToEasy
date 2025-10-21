const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Room = require('./Room');
const Customer = require('./Customer');

const Booking = sequelize.define('Booking', {
  bookingId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookingDate: DataTypes.DATEONLY,
  checkInDate: DataTypes.DATEONLY,
  checkOutDate: DataTypes.DATEONLY,
  status: DataTypes.STRING,
  totalAmount: DataTypes.FLOAT,
  numberOfGuests: DataTypes.INTEGER,
  customerId: DataTypes.INTEGER,
  roomId: DataTypes.INTEGER
}, { tableName: 'Booking', timestamps: false });

Booking.belongsTo(Room, { foreignKey: 'roomId' });
Booking.belongsTo(Customer, { foreignKey: 'customerId' });

module.exports = Booking;
