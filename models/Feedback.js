const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Feedback = sequelize.define('Feedback', {
  feedbackId: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  providerId: {
    type: DataTypes.INTEGER,
    references: { model: 'Provider', key: 'providerId' }
  },
  reviewId: {
    type: DataTypes.INTEGER,
    references: { model: 'Review', key: 'reviewId' }
  },
  message: {
    type: DataTypes.TEXT
  },
  feedbackDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'feedback',
  timestamps: false
});

module.exports = Feedback;