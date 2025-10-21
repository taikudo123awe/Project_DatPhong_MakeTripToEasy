// Import tất cả các model
const Account = require('./Account');
const Provider = require('./Provider');
const Room = require('./Room');
const Customer = require('./Customer');
const Review = require('./Review');
const Feedback = require('./Feedback');
const Admin = require('./Admin');
const Booking = require('./Booking');
const Invoice = require('./Invoice');

// --- Định nghĩa các mối quan hệ mới ---

// Customer <-> Account (1-1)
Customer.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasOne(Customer, { foreignKey: 'accountId' });

// Review <-> Customer (1-N)
Review.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Review, { foreignKey: 'customerId' });

// Review <-> Room (1-N)
Review.belongsTo(Room, { foreignKey: 'roomId' });
Room.hasMany(Review, { foreignKey: 'roomId' });

// Feedback <-> Provider (1-N)
Feedback.belongsTo(Provider, { foreignKey: 'providerId' });
Provider.hasMany(Feedback, { foreignKey: 'providerId' });

// Feedback <-> Review (1-1)
Feedback.belongsTo(Review, { foreignKey: 'reviewId' });
Review.hasOne(Feedback, { foreignKey: 'reviewId' });

// Admin <-> Account (1-1)
Admin.belongsTo(Account, { foreignKey: 'accountId' });
Account.hasOne(Admin, { foreignKey: 'accountId' });

// Customer <-> Booking (1-N)
Booking.belongsTo(Customer, { foreignKey: 'customerId', onDelete: 'CASCADE' });
Customer.hasMany(Booking, { foreignKey: 'customerId', onDelete: 'CASCADE' });

// Room <-> Booking (1-N)
Booking.belongsTo(Room, { foreignKey: 'roomId', onDelete: 'CASCADE' });
Room.hasMany(Booking, { foreignKey: 'roomId', onDelete: 'CASCADE' });

// Invoice <-> Booking (N-1)
Invoice.belongsTo(Booking, { foreignKey: 'bookingId', onDelete: 'CASCADE' });
Booking.hasOne(Invoice, { foreignKey: 'bookingId', onDelete: 'CASCADE' });

// Invoice <-> Customer (N-1)
Invoice.belongsTo(Customer, { foreignKey: 'customerId', onDelete: 'SET NULL' });
Customer.hasMany(Invoice, { foreignKey: 'customerId', onDelete: 'SET NULL' });

console.log('--- Các liên kết model (Associations) đã được định nghĩa ---');