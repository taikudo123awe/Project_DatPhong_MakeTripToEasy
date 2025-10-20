const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Review = sequelize.define('Review', {
  reviewId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  customerId: {
    type: DataTypes.INTEGER,
    references: { model: 'Customer', key: 'customerId' }
  },
  roomId: {
    type: DataTypes.INTEGER,
    references: { model: 'Room', key: 'roomId' }
  },
  comment: {
    type: DataTypes.TEXT
  },
  rating: {
    type: DataTypes.INTEGER
  },
  reviewDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'review',
  timestamps: false
});

module.exports = Review;