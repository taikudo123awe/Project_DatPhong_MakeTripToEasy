SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- 1️⃣ BẢNG ACCOUNT
-- =====================================================
CREATE TABLE `Account` (
  `accountId` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'active',
  PRIMARY KEY (`accountId`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 2️⃣ BẢNG ADDRESS
-- =====================================================
CREATE TABLE `Address` (
  `addressId` int(11) NOT NULL AUTO_INCREMENT,
  `city` varchar(58) DEFAULT NULL,
  `district` varchar(58) DEFAULT NULL,
  `ward` varchar(58) DEFAULT NULL,
  PRIMARY KEY (`addressId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 3️⃣ BẢNG PROVIDER
-- =====================================================
CREATE TABLE `Provider` (
  `providerId` int(11) NOT NULL AUTO_INCREMENT,
  `providerName` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `identityNumber` varchar(12) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `taxCode` varchar(20) DEFAULT NULL,
  `accountId` int(11) DEFAULT NULL,
  PRIMARY KEY (`providerId`),
  UNIQUE KEY `identityNumber` (`identityNumber`),
  KEY `accountId` (`accountId`),
  CONSTRAINT `Provider_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `Account` (`accountId`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 4️⃣ BẢNG ROOMTYPE (LOẠI PHÒNG)
-- =====================================================
CREATE TABLE `RoomType` (
  `roomTypeId` int(11) NOT NULL AUTO_INCREMENT,
  `typeName` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  PRIMARY KEY (`roomTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 5️⃣ BẢNG ROOM (CẬP NHẬT)
-- =====================================================
CREATE TABLE `Room` (
  `roomId` int(11) NOT NULL AUTO_INCREMENT,
  `roomName` varchar(255) NOT NULL,
  `capacity` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `fullAddress` varchar(255) DEFAULT NULL,
  `status` varchar(30) DEFAULT 'Hoạt động',
  `postedAt` datetime DEFAULT NULL,
  `approvalStatus` varchar(30) DEFAULT 'Chờ duyệt',
  `providerId` int(11) DEFAULT NULL,
  `addressId` int(11) DEFAULT NULL,
  `roomTypeId` int(11) DEFAULT NULL,
  `availableRooms` int(11) DEFAULT 1,
  PRIMARY KEY (`roomId`),
  KEY `providerId` (`providerId`),
  KEY `addressId` (`addressId`),
  KEY `roomTypeId` (`roomTypeId`),
  CONSTRAINT `Room_ibfk_2` FOREIGN KEY (`addressId`) REFERENCES `Address` (`addressId`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Room_ibfk_3` FOREIGN KEY (`providerId`) REFERENCES `Provider` (`providerId`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `Room_ibfk_4` FOREIGN KEY (`roomTypeId`) REFERENCES `RoomType` (`roomTypeId`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 6️⃣ BẢNG AMENITY (TIỆN ÍCH)
-- =====================================================
CREATE TABLE `Amenity` (
  `amenityId` int(11) NOT NULL AUTO_INCREMENT,
  `amenityName` varchar(100) NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`amenityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 7️⃣ BẢNG ROOMAMENITY (LIÊN KẾT N-N)
-- =====================================================
CREATE TABLE `RoomAmenity` (
  `roomId` int(11) NOT NULL,
  `amenityId` int(11) NOT NULL,
  PRIMARY KEY (`roomId`, `amenityId`),
  CONSTRAINT `RoomAmenity_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `Room` (`roomId`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `RoomAmenity_ibfk_2` FOREIGN KEY (`amenityId`) REFERENCES `Amenity` (`amenityId`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- =====================================================
-- 8️⃣ CÁC BẢNG CÒN LẠI
-- =====================================================

CREATE TABLE `Admin` (
  `adminId` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `accountId` int(11) DEFAULT NULL,
  PRIMARY KEY (`adminId`),
  KEY `accountId` (`accountId`),
  CONSTRAINT `Admin_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `Account` (`accountId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Customer` (
  `customerId` int(11) NOT NULL AUTO_INCREMENT,
  `fullName` varchar(58) DEFAULT NULL,
  `identityNumber` varchar(12) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `accountId` int(11) DEFAULT NULL,
  PRIMARY KEY (`customerId`),
  KEY `accountId` (`accountId`),
  CONSTRAINT `Customer_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `Account` (`accountId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Booking` (
  `bookingId` int(11) NOT NULL AUTO_INCREMENT,
  `bookingDate` date DEFAULT NULL,
  `checkInDate` date DEFAULT NULL,
  `checkOutDate` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `totalAmount` float DEFAULT NULL,
  `numberOfGuests` int(11) DEFAULT NULL,
  `customerId` int(11) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  PRIMARY KEY (`bookingId`),
  KEY `customerId` (`customerId`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `Booking_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`customerId`),
  CONSTRAINT `Booking_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `Room` (`roomId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Review` (
  `reviewId` int(11) NOT NULL AUTO_INCREMENT,
  `customerId` int(11) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `reviewDate` datetime DEFAULT NULL,
  PRIMARY KEY (`reviewId`),
  KEY `customerId` (`customerId`),
  KEY `roomId` (`roomId`),
  CONSTRAINT `Review_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`customerId`),
  CONSTRAINT `Review_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `Room` (`roomId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Feedback` (
  `feedbackId` int(11) NOT NULL AUTO_INCREMENT,
  `providerId` int(11) DEFAULT NULL,
  `reviewId` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `feedbackDate` datetime DEFAULT NULL,
  PRIMARY KEY (`feedbackId`),
  KEY `providerId` (`providerId`),
  KEY `reviewId` (`reviewId`),
  CONSTRAINT `Feedback_ibfk_1` FOREIGN KEY (`providerId`) REFERENCES `Provider` (`providerId`),
  CONSTRAINT `Feedback_ibfk_2` FOREIGN KEY (`reviewId`) REFERENCES `Review` (`reviewId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `Invoice` (
  `invoiceId` int(11) NOT NULL AUTO_INCREMENT,
  `invoiceDate` date DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `customerId` int(11) DEFAULT NULL,
  `bookingId` int(11) DEFAULT NULL,
  PRIMARY KEY (`invoiceId`),
  KEY `customerId` (`customerId`),
  KEY `bookingId` (`bookingId`),
  CONSTRAINT `Invoice_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`customerId`),
  CONSTRAINT `Invoice_ibfk_2` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`bookingId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE `PaymentInfo` (
  `paymentInfoId` int(11) NOT NULL AUTO_INCREMENT,
  `bankName` varchar(50) DEFAULT NULL,
  `accountHolder` varchar(50) DEFAULT NULL,
  `accountNumber` varchar(15) DEFAULT NULL,
  `qrCode` varchar(255) DEFAULT NULL,
  `providerId` int(11) DEFAULT NULL,
  PRIMARY KEY (`paymentInfoId`),
  KEY `providerId` (`providerId`),
  CONSTRAINT `PaymentInfo_ibfk_1` FOREIGN KEY (`providerId`) REFERENCES `Provider` (`providerId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
