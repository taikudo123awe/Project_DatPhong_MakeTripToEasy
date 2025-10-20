
-- SQL schema for room booking application
-- Generated on 2025-10-15 15:48:41

-- Drop tables if exist (to avoid duplicate import issues)
DROP TABLE IF EXISTS Feedback, Review, Invoice, Booking, PaymentInfo, Room, Address, Customer, Provider, Admin, Account;

-- Account Table
CREATE TABLE Account (
    accountId INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role INT NOT NULL,
    status VARCHAR(20)
);

-- Admin Table
CREATE TABLE Admin (
    adminId INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255),
    phoneNumber VARCHAR(15),
    accountId INT,
    FOREIGN KEY (accountId) REFERENCES Account(accountId)
);

-- Provider Table
CREATE TABLE Provider (
    providerId INT AUTO_INCREMENT PRIMARY KEY,
    providerName VARCHAR(50),
    email VARCHAR(255),
    phoneNumber VARCHAR(15),
    taxCode VARCHAR(20),
    accountId INT,
    FOREIGN KEY (accountId) REFERENCES Account(accountId)
);

-- Address Table
CREATE TABLE Address (
    addressId INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(58),
    district VARCHAR(58),
    ward VARCHAR(58)
);

-- Customer Table
CREATE TABLE Customer (
    customerId INT AUTO_INCREMENT PRIMARY KEY,
    fullName VARCHAR(58),
    identityNumber VARCHAR(12),
    email VARCHAR(255),
    phoneNumber VARCHAR(15),
    accountId INT,
    FOREIGN KEY (accountId) REFERENCES Account(accountId)
);

-- Room Table
CREATE TABLE Room (
    roomId INT AUTO_INCREMENT PRIMARY KEY,
    roomName VARCHAR(255),
    capacity INT,
    price FLOAT,
    amenities VARCHAR(255),
    description TEXT,
    image VARCHAR(255),
    fullAddress VARCHAR(255),
    status VARCHAR(30), -- Hoạt động, Bảo trì, Đã xóa
    postedAt DATETIME,
    approvalStatus VARCHAR(30), -- Đã duyệt, Chờ duyệt
    providerId INT,
    addressId INT,
    FOREIGN KEY (providerId) REFERENCES Provider(providerId),
    FOREIGN KEY (addressId) REFERENCES Address(addressId)
);

-- PaymentInfo Table
CREATE TABLE PaymentInfo (
    paymentInfoId INT AUTO_INCREMENT PRIMARY KEY,
    bankName VARCHAR(50),
    accountHolder VARCHAR(50),
    accountNumber VARCHAR(15),
    qrCode VARCHAR(255),
    providerId INT,
    FOREIGN KEY (providerId) REFERENCES Provider(providerId)
);

-- Booking Table
CREATE TABLE Booking (
    bookingId INT AUTO_INCREMENT PRIMARY KEY,
    bookingDate DATE,
    checkInDate DATE,
    checkOutDate DATE,
    status VARCHAR(255), -- Chờ nhận phòng, Đã nhận phòng, Đã thanh toán
    totalAmount FLOAT,
    numberOfGuests INT,
    customerId INT,
    roomId INT,
    FOREIGN KEY (customerId) REFERENCES Customer(customerId),
    FOREIGN KEY (roomId) REFERENCES Room(roomId)
);

-- Invoice Table
CREATE TABLE Invoice (
    invoiceId INT AUTO_INCREMENT PRIMARY KEY,
    invoiceDate DATE,
    amount FLOAT,
    status VARCHAR(50), -- Chờ thanh toán, Đã thanh toán, Hủy
    customerId INT,
    bookingId INT,
    FOREIGN KEY (customerId) REFERENCES Customer(customerId),
    FOREIGN KEY (bookingId) REFERENCES Booking(bookingId)
);

-- Review Table
CREATE TABLE Review (
    reviewId INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT,
    roomId INT,
    comment TEXT,
    rating INT,
    reviewDate DATETIME,
    FOREIGN KEY (customerId) REFERENCES Customer(customerId),
    FOREIGN KEY (roomId) REFERENCES Room(roomId)
);

-- Feedback Table
CREATE TABLE Feedback (
    feedbackId INT AUTO_INCREMENT PRIMARY KEY,
    providerId INT,
    reviewId INT,
    message TEXT,
    feedbackDate DATETIME,
    FOREIGN KEY (providerId) REFERENCES Provider(providerId),
    FOREIGN KEY (reviewId) REFERENCES Review(reviewId)
);



-- Dummy data for room booking system

-- Accounts (Admin, Provider, Customer)
INSERT INTO Account (username, password, role, status) VALUES 
('admin1', 'adminpass', 0, 'active'),
('provider1', 'providerpass', 1, 'active'),
('customer1', 'customerpass', 2, 'active');

-- Admin
INSERT INTO Admin (email, phoneNumber, accountId) VALUES 
('admin@example.com', '0123456789', 1);

-- Provider
INSERT INTO Provider (providerName, email, phoneNumber, taxCode, accountId) VALUES 
('Nhà cung cấp A', 'provider@example.com', '0987654321', 'TAX123', 2);

-- Customer
INSERT INTO Customer (fullName, identityNumber, email, phoneNumber, accountId) VALUES 
('Nguyễn Văn A', '123456789012', 'customer@example.com', '0909123456', 3);

-- Address
INSERT INTO Address (city, district, ward) VALUES 
('TP HCM', 'Quận 1', 'Phường Bến Nghé');

-- Room
INSERT INTO Room (roomName, capacity, price, amenities, description, image, fullAddress, status, postedAt, approvalStatus, providerId, addressId) VALUES 
('Phòng 1', 4, 500000, 'Máy nước nóng, Wifi', 'Phòng đẹp, sạch sẽ', NULL, '123 Lý Tự Trọng, Quận 1', 'Hoạt động', NOW(), 'Đã duyệt', 1, 1),
('Phòng 2', 2, 300000, 'Máy lạnh, Tivi', 'Phòng nhỏ cho 2 người', NULL, '456 Nguyễn Huệ, Quận 1', 'Hoạt động', NOW(), 'Chờ duyệt', 1, 1);

-- PaymentInfo
INSERT INTO PaymentInfo (bankName, accountHolder, accountNumber, qrCode, providerId) VALUES 
('Vietcombank', 'Nhà cung cấp A', '0123456789', 'qrcode1.png', 1);

-- Booking
INSERT INTO Booking (bookingDate, checkInDate, checkOutDate, status, totalAmount, numberOfGuests, customerId, roomId) VALUES 
(CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 DAY), DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Chờ nhận phòng', 1000000, 2, 1, 1);

-- Invoice
INSERT INTO Invoice (invoiceDate, amount, status, customerId, bookingId) VALUES 
(CURDATE(), 1000000, 'Chờ thanh toán', 1, 1);

-- Review
INSERT INTO Review (customerId, roomId, comment, rating, reviewDate) VALUES 
(1, 1, 'Phòng rất đẹp và sạch', 5, NOW());

-- Feedback
INSERT INTO Feedback (providerId, reviewId, message, feedbackDate) VALUES 
(1, 1, 'Cảm ơn bạn đã đánh giá tốt!', NOW());
