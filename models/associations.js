// Import tất cả các model
const Account = require('./Account');
const Provider = require('./Provider');
const Room = require('./Room');
const Customer = require('./Customer');
const Review = require('./Review');
const Feedback = require('./Feedback');
//
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


//Thêm

// Booking <-> Customer (N-1)
Booking.belongsTo(Customer, { foreignKey: 'customerId' });
Customer.hasMany(Booking, { foreignKey: 'customerId' });

// Booking <-> Room (N-1)
Booking.belongsTo(Room, { foreignKey: 'roomId' });
Room.hasMany(Booking, { foreignKey: 'roomId' });

Invoice.belongsTo(Booking, { foreignKey: 'bookingId', as: 'booking' });
Booking.hasOne(Invoice, { foreignKey: 'bookingId', as: 'invoice' });

// Room <-> Provider (N-1)
Room.belongsTo(Provider, { foreignKey: 'providerId' });
Provider.hasMany(Room, { foreignKey: 'providerId' });


console.log('--- Các liên kết model (Associations) đã được định nghĩa ---');