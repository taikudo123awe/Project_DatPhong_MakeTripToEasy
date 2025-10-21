const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Provider = require('./Provider');
const Address = require("./Address");

const Room = sequelize.define('Room', {
  roomId: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  roomName: { type: DataTypes.STRING, allowNull: false },
  capacity: DataTypes.INTEGER,
  price: DataTypes.FLOAT,
  description: DataTypes.TEXT,
  image: DataTypes.STRING,
  status: { type: DataTypes.STRING, defaultValue: 'Hoạt động' }, // hoặc 'Bảo trì'
  approvalStatus: { type: DataTypes.STRING, defaultValue: 'Chờ duyệt' },
  postedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  providerId: { type: DataTypes.INTEGER, allowNull: false }
}, {
  tableName: 'Room',
  timestamps: false
});

// Liên kết
Room.belongsTo(Provider, { foreignKey: 'providerId' });
Provider.hasMany(Room, { foreignKey: 'providerId' });

Room.belongsTo(Address, { foreignKey: "addressId", as: "address" });
Address.hasMany(Room, { foreignKey: "addressId", as: "rooms" });

module.exports = Room;
