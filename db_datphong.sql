-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Máy chủ: mydb:3306
-- Thời gian đã tạo: Th10 20, 2025 lúc 07:29 AM
-- Phiên bản máy phục vụ: 11.7.2-MariaDB-ubu2404
-- Phiên bản PHP: 8.2.28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `db_datphong`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Account`
--

CREATE TABLE `Account` (
  `accountId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) NOT NULL,
  `status` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Account`
--

INSERT INTO `Account` (`accountId`, `username`, `password`, `role`, `status`) VALUES
(1, 'user1', 'pass1', 0, 'active'),
(2, 'user2', 'pass2', 0, 'active'),
(3, 'user3', 'pass3', 1, 'active'),
(4, 'user4', 'pass4', 0, 'active'),
(5, 'user5', 'pass5', 0, 'active'),
(6, 'user6', 'pass6', 1, 'active'),
(7, 'user7', 'pass7', 1, 'active'),
(8, 'user8', 'pass8', 2, 'active'),
(9, 'user9', 'pass9', 2, 'active'),
(10, 'user10', 'pass10', 2, 'active'),
(11, 'user11', 'pass11', 0, 'active'),
(12, 'user12', 'pass12', 2, 'active'),
(13, 'user13', 'pass13', 2, 'active'),
(14, 'user14', 'pass14', 2, 'active'),
(15, 'user15', 'pass15', 0, 'active'),
(16, 'user16', 'pass16', 1, 'active'),
(17, 'user17', 'pass17', 0, 'active'),
(18, 'user18', 'pass18', 1, 'active'),
(19, 'user19', 'pass19', 1, 'active'),
(20, 'user20', 'pass20', 1, 'active'),
(21, '0123123132', '$2b$10$n1UylfHIcXC/s6W.0ccUteZhWMDv2VrfAH8hQaIDDrePM4bIe/bmO', 1, 'active'),
(22, '0123123131', '$2b$10$ktTq6y6GO1Hw/YmozUWfM.UAD1yw.Xdo8Cd.93IpEIQqmVwSA6vyu', 1, 'active'),
(23, '0212121212', '$2b$10$FpgoSwvnD.qQnaZqtttpROot5FtApZeSaGdlmISAgnPG24FFlPwBG', 1, 'active'),
(24, '0212121211', '$2b$10$ICCPDRsiDNcVWSJ5Un/uFO8Bnqm9dq/fXlpVS.94Nh3d0ChIuWZjO', 1, 'active'),
(25, '0212121213', '$2b$10$IJPbu906AgtFPed3kGhKy.nMQ43vhqLLdfU/LFMNCEcbk0CcJ0ISW', 1, 'active'),
(26, '0141414141', '$2b$10$nDmmJO.cw5cwwJzveKo2zutLks5t6wNrSxuJkvtjKPFSkSj.zXSKy', 1, 'active'),
(27, '0123456789', '$2b$10$05ArFoqLBtS3Sf3DXIH/n.ns5A0FfDpiRZTNO.0QRfR7i3RE4rVMK', 1, 'active');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Address`
--

CREATE TABLE `Address` (
  `addressId` int(11) NOT NULL,
  `city` varchar(58) DEFAULT NULL,
  `district` varchar(58) DEFAULT NULL,
  `ward` varchar(58) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Address`
--

INSERT INTO `Address` (`addressId`, `city`, `district`, `ward`) VALUES
(1, 'City1', 'District1', 'Ward1'),
(2, 'City2', 'District2', 'Ward2'),
(3, 'City3', 'District3', 'Ward3'),
(4, 'City4', 'District4', 'Ward4'),
(5, 'City5', 'District5', 'Ward5'),
(6, 'City6', 'District6', 'Ward6'),
(7, 'City7', 'District7', 'Ward7'),
(8, 'City8', 'District8', 'Ward8'),
(9, 'City9', 'District9', 'Ward9'),
(10, 'City10', 'District10', 'Ward10');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Admin`
--

CREATE TABLE `Admin` (
  `adminId` int(11) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `accountId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Admin`
--

INSERT INTO `Admin` (`adminId`, `email`, `phoneNumber`, `accountId`) VALUES
(1, 'admin@example.com', '0909000000', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Booking`
--

CREATE TABLE `Booking` (
  `bookingId` int(11) NOT NULL,
  `bookingDate` date DEFAULT NULL,
  `checkInDate` date DEFAULT NULL,
  `checkOutDate` date DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `totalAmount` float DEFAULT NULL,
  `numberOfGuests` int(11) DEFAULT NULL,
  `customerId` int(11) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Booking`
--

INSERT INTO `Booking` (`bookingId`, `bookingDate`, `checkInDate`, `checkOutDate`, `status`, `totalAmount`, `numberOfGuests`, `customerId`, `roomId`) VALUES
(1, '2025-10-19', '2025-10-20', '2025-10-22', 'Đã đặt', 1435000, 5, 3, 7),
(2, '2025-10-19', '2025-10-21', '2025-10-23', 'Đã đặt', 2815000, 1, 7, 26),
(3, '2025-10-19', '2025-10-22', '2025-10-24', 'Đã đặt', 2948000, 3, 9, 16),
(4, '2025-10-19', '2025-10-23', '2025-10-25', 'Đã đặt', 4814000, 2, 8, 26),
(5, '2025-10-19', '2025-10-24', '2025-10-26', 'Đã đặt', 626000, 1, 2, 19),
(6, '2025-10-19', '2025-10-25', '2025-10-27', 'Đã đặt', 2405000, 5, 5, 19),
(7, '2025-10-19', '2025-10-26', '2025-10-28', 'Đã đặt', 1842000, 1, 10, 10),
(8, '2025-10-19', '2025-10-27', '2025-10-29', 'Đã đặt', 851000, 4, 7, 13),
(9, '2025-10-19', '2025-10-28', '2025-10-30', 'Đã đặt', 2239000, 4, 4, 30),
(10, '2025-10-19', '2025-10-29', '2025-10-31', 'Đã đặt', 4954000, 4, 6, 26);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Customer`
--

CREATE TABLE `Customer` (
  `customerId` int(11) NOT NULL,
  `fullName` varchar(58) DEFAULT NULL,
  `identityNumber` varchar(12) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `accountId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Customer`
--

INSERT INTO `Customer` (`customerId`, `fullName`, `identityNumber`, `email`, `phoneNumber`, `accountId`) VALUES
(1, 'Customer 1', '200000000001', 'customer1@mail.com', '0987267711', 11),
(2, 'Customer 2', '200000000002', 'customer2@mail.com', '0987824223', 12),
(3, 'Customer 3', '200000000003', 'customer3@mail.com', '0987998506', 13),
(4, 'Customer 4', '200000000004', 'customer4@mail.com', '0987844835', 14),
(5, 'Customer 5', '200000000005', 'customer5@mail.com', '0987560948', 15),
(6, 'Customer 6', '200000000006', 'customer6@mail.com', '0987542259', 16),
(7, 'Customer 7', '200000000007', 'customer7@mail.com', '0987837427', 17),
(8, 'Customer 8', '200000000008', 'customer8@mail.com', '0987477589', 18),
(9, 'Customer 9', '200000000009', 'customer9@mail.com', '0987569657', 19),
(10, 'Customer 10', '200000000010', 'customer10@mail.com', '0987843562', 20);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Feedback`
--

CREATE TABLE `Feedback` (
  `feedbackId` int(11) NOT NULL,
  `providerId` int(11) DEFAULT NULL,
  `reviewId` int(11) DEFAULT NULL,
  `message` text DEFAULT NULL,
  `feedbackDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Feedback`
--

INSERT INTO `Feedback` (`feedbackId`, `providerId`, `reviewId`, `message`, `feedbackDate`) VALUES
(1, 6, 1, 'Feedback 1 reply', '2025-10-02 18:52:38'),
(2, 3, 2, 'Feedback 2 reply', '2025-09-29 18:52:38'),
(3, 5, 3, 'Feedback 3 reply', '2025-09-19 18:52:38'),
(4, 7, 4, 'Feedback 4 reply', '2025-10-13 18:52:38'),
(5, 2, 5, 'Feedback 5 reply', '2025-10-15 18:52:38'),
(6, 1, 6, 'Feedback 6 reply', '2025-10-09 18:52:38'),
(7, 2, 7, 'Feedback 7 reply', '2025-10-10 18:52:38'),
(8, 5, 8, 'Feedback 8 reply', '2025-09-19 18:52:38'),
(9, 9, 9, 'Feedback 9 reply', '2025-10-01 18:52:38'),
(10, 4, 10, 'Feedback 10 reply', '2025-09-28 18:52:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Invoice`
--

CREATE TABLE `Invoice` (
  `invoiceId` int(11) NOT NULL,
  `invoiceDate` date DEFAULT NULL,
  `amount` float DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `customerId` int(11) DEFAULT NULL,
  `bookingId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Invoice`
--

INSERT INTO `Invoice` (`invoiceId`, `invoiceDate`, `amount`, `status`, `customerId`, `bookingId`) VALUES
(1, '2025-10-19', 4938000, 'Đã thanh toán', 3, 1),
(2, '2025-10-19', 545000, 'Đã thanh toán', 5, 2),
(3, '2025-10-19', 553000, 'Đã thanh toán', 2, 3),
(4, '2025-10-19', 2194000, 'Đã thanh toán', 10, 4),
(5, '2025-10-19', 1373000, 'Đã thanh toán', 1, 5),
(6, '2025-10-19', 3892000, 'Đã thanh toán', 4, 6),
(7, '2025-10-19', 2283000, 'Đã thanh toán', 8, 7),
(8, '2025-10-19', 1850000, 'Đã thanh toán', 3, 8),
(9, '2025-10-19', 1327000, 'Đã thanh toán', 7, 9),
(10, '2025-10-19', 4121000, 'Đã thanh toán', 7, 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `PaymentInfo`
--

CREATE TABLE `PaymentInfo` (
  `paymentInfoId` int(11) NOT NULL,
  `bankName` varchar(50) DEFAULT NULL,
  `accountHolder` varchar(50) DEFAULT NULL,
  `accountNumber` varchar(15) DEFAULT NULL,
  `qrCode` varchar(255) DEFAULT NULL,
  `providerId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `PaymentInfo`
--

INSERT INTO `PaymentInfo` (`paymentInfoId`, `bankName`, `accountHolder`, `accountNumber`, `qrCode`, `providerId`) VALUES
(1, 'Bank 1', 'Provider 1', '256314667343', 'qrcode1.png', 1),
(2, 'Bank 2', 'Provider 2', '931125593459', 'qrcode2.png', 2),
(3, 'Bank 3', 'Provider 3', '386043726562', 'qrcode3.png', 3),
(4, 'Bank 4', 'Provider 4', '581077359913', 'qrcode4.png', 4),
(5, 'Bank 5', 'Provider 5', '690813717210', 'qrcode5.png', 5),
(6, 'Bank 6', 'Provider 6', '239764019351', 'qrcode6.png', 6),
(7, 'Bank 7', 'Provider 7', '490522989783', 'qrcode7.png', 7),
(8, 'Bank 8', 'Provider 8', '148143264935', 'qrcode8.png', 8),
(9, 'Bank 9', 'Provider 9', '134349076086', 'qrcode9.png', 9),
(10, 'Bank 10', 'Provider 10', '626925637944', 'qrcode10.png', 10);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Provider`
--

CREATE TABLE `Provider` (
  `providerId` int(11) NOT NULL,
  `providerName` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `identityNumber` varchar(12) NOT NULL,
  `phoneNumber` varchar(15) DEFAULT NULL,
  `taxCode` varchar(20) DEFAULT NULL,
  `accountId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Provider`
--

INSERT INTO `Provider` (`providerId`, `providerName`, `email`, `identityNumber`, `phoneNumber`, `taxCode`, `accountId`) VALUES
(1, 'Provider 1', 'provider1@mail.com', '100000000001', '0909385470', 'TX6221', 2),
(2, 'Provider 2', 'provider2@mail.com', '100000000002', '0909291904', 'TX7819', 3),
(3, 'Provider 3', 'provider3@mail.com', '100000000003', '0909985242', 'TX6750', 4),
(4, 'Provider 4', 'provider4@mail.com', '100000000004', '0909597430', 'TX3793', 5),
(5, 'Provider 5', 'provider5@mail.com', '100000000005', '0909506693', 'TX2703', 6),
(6, 'Provider 6', 'provider6@mail.com', '100000000006', '0909868542', 'TX1078', 7),
(7, 'Provider 7', 'provider7@mail.com', '100000000007', '0909843819', 'TX6605', 8),
(8, 'Provider 8', 'provider8@mail.com', '100000000008', '0909163214', 'TX9873', 9),
(9, 'Provider 9', 'provider9@mail.com', '100000000009', '0909862151', 'TX3867', 10),
(10, 'Provider 10', 'provider10@mail.com', '100000000010', '0909289201', 'TX1432', 11),
(11, 'Truong123@', 'Truong123@gmail.com', '132321321333', '0123123132', '1231233210', 21),
(12, 'Truong1232@', 'Truong1231@gmail.com', '132321321337', '0123123131', '1231233211', 22),
(13, 'Trong123@', 'Trong123@gmail.com', '132121211212', '0212121212', '21212121121', 23),
(14, 'Troong123@', 'Troong123@gmail.com', '132121211211', '0212121211', '21212121122', 24),
(15, 'Troong1123@', 'Troong1123@gmail.com', '132121211213', '0212121213', '21212121123', 25),
(16, 'Tai12345@', 'Tai12345@gmail.com', '141414141414', '0141414141', '04141414141', 26),
(17, 'Abc1234@', 'Abc123@gmail.com', '123321123321', '0123456789', '1236457984', 27);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Review`
--

CREATE TABLE `Review` (
  `reviewId` int(11) NOT NULL,
  `customerId` int(11) DEFAULT NULL,
  `roomId` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `reviewDate` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Review`
--

INSERT INTO `Review` (`reviewId`, `customerId`, `roomId`, `comment`, `rating`, `reviewDate`) VALUES
(1, 1, 6, 'Review 1 content', 3, '2025-10-15 18:52:38'),
(2, 9, 29, 'Review 2 content', 2, '2025-09-23 18:52:38'),
(3, 9, 9, 'Review 3 content', 4, '2025-09-30 18:52:38'),
(4, 4, 6, 'Review 4 content', 3, '2025-09-20 18:52:38'),
(5, 2, 24, 'Review 5 content', 2, '2025-10-15 18:52:38'),
(6, 4, 20, 'Review 6 content', 2, '2025-10-13 18:52:38'),
(7, 3, 28, 'Review 7 content', 2, '2025-10-08 18:52:38'),
(8, 8, 24, 'Review 8 content', 3, '2025-09-20 18:52:38'),
(9, 8, 10, 'Review 9 content', 2, '2025-10-02 18:52:38'),
(10, 8, 20, 'Review 10 content', 5, '2025-09-29 18:52:38');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `Room`
--

CREATE TABLE `Room` (
  `roomId` int(11) NOT NULL,
  `roomName` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `amenities` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `fullAddress` varchar(255) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `postedAt` datetime DEFAULT NULL,
  `approvalStatus` varchar(30) DEFAULT NULL,
  `providerId` int(11) DEFAULT NULL,
  `addressId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

--
-- Đang đổ dữ liệu cho bảng `Room`
--

INSERT INTO `Room` (`roomId`, `roomName`, `capacity`, `price`, `amenities`, `description`, `image`, `fullAddress`, `status`, `postedAt`, `approvalStatus`, `providerId`, `addressId`) VALUES
(1, 'Room 1', 3, 369000, 'WiFi,TV', 'Room 1 description.', 'room1.jpg', '123 Street 1', 'Hoạt động', '2025-07-25 18:52:38', 'Đã duyệt', 8, 6),
(2, 'Room 2', 4, 861000, 'WiFi,TV', 'Room 2 description.', 'room2.jpg', '123 Street 2', 'Hoạt động', '2025-10-04 18:52:38', 'Đã duyệt', 9, 2),
(3, 'Room 3', 2, 1680000, 'WiFi,TV', 'Room 3 description.', 'room3.jpg', '123 Street 3', 'Hoạt động', '2025-08-02 18:52:38', 'Đã duyệt', 5, 7),
(4, 'Room 4', 6, 1661000, 'WiFi,TV', 'Room 4 description.', 'room4.jpg', '123 Street 4', 'Hoạt động', '2025-10-04 18:52:38', 'Đã duyệt', 8, 7),
(5, 'Room 5', 3, 911000, 'WiFi,TV', 'Room 5 description.', 'room5.jpg', '123 Street 5', 'Hoạt động', '2025-09-27 18:52:38', 'Đã duyệt', 5, 5),
(6, 'Room 6', 3, 735000, 'WiFi,TV', 'Room 6 description.', 'room6.jpg', '123 Street 6', 'Hoạt động', '2025-08-15 18:52:38', 'Đã duyệt', 1, 7),
(7, 'Room 7', 4, 1941000, 'WiFi,TV', 'Room 7 description.', 'room7.jpg', '123 Street 7', 'Hoạt động', '2025-09-09 18:52:38', 'Đã duyệt', 6, 7),
(8, 'Room 8', 4, 1120000, 'WiFi,TV', 'Room 8 description.', 'room8.jpg', '123 Street 8', 'Hoạt động', '2025-07-16 18:52:38', 'Đã duyệt', 7, 6),
(9, 'Room 9', 2, 1635000, 'WiFi,TV', 'Room 9 description.', 'room9.jpg', '123 Street 9', 'Hoạt động', '2025-09-14 18:52:38', 'Đã duyệt', 10, 7),
(10, 'Room 10', 4, 448000, 'WiFi,TV', 'Room 10 description.', 'room10.jpg', '123 Street 10', 'Hoạt động', '2025-08-07 18:52:38', 'Đã duyệt', 6, 4),
(11, 'Room 11', 4, 335000, 'WiFi,TV', 'Room 11 description.', 'room11.jpg', '123 Street 11', 'Hoạt động', '2025-09-29 18:52:38', 'Đã duyệt', 8, 1),
(12, 'Room 12', 5, 1251000, 'WiFi,TV', 'Room 12 description.', 'room12.jpg', '123 Street 12', 'Hoạt động', '2025-08-17 18:52:38', 'Đã duyệt', 5, 8),
(13, 'Room 13', 6, 1634000, 'WiFi,TV', 'Room 13 description.', 'room13.jpg', '123 Street 13', 'Hoạt động', '2025-07-30 18:52:38', 'Đã duyệt', 9, 6),
(14, 'Room 14', 4, 1079000, 'WiFi,TV', 'Room 14 description.', 'room14.jpg', '123 Street 14', 'Hoạt động', '2025-09-20 18:52:38', 'Đã duyệt', 4, 1),
(15, 'Room 15', 5, 480000, 'WiFi,TV', 'Room 15 description.', 'room15.jpg', '123 Street 15', 'Hoạt động', '2025-07-24 18:52:38', 'Đã duyệt', 10, 6),
(16, 'Room 16', 3, 825000, 'WiFi,TV', 'Room 16 description.', 'room16.jpg', '123 Street 16', 'Hoạt động', '2025-08-02 18:52:38', 'Đã duyệt', 9, 2),
(17, 'Room 17', 5, 443000, 'WiFi,TV', 'Room 17 description.', 'room17.jpg', '123 Street 17', 'Hoạt động', '2025-07-17 18:52:38', 'Đã duyệt', 4, 5),
(18, 'Room 18', 6, 1620000, 'WiFi,TV', 'Room 18 description.', 'room18.jpg', '123 Street 18', 'Hoạt động', '2025-07-22 18:52:38', 'Đã duyệt', 7, 8),
(19, 'Room 19', 6, 866000, 'WiFi,TV', 'Room 19 description.', 'room19.jpg', '123 Street 19', 'Hoạt động', '2025-08-27 18:52:38', 'Đã duyệt', 10, 9),
(20, 'Room 20', 2, 1571000, 'WiFi,TV', 'Room 20 description.', 'room20.jpg', '123 Street 20', 'Hoạt động', '2025-10-03 18:52:38', 'Đã duyệt', 10, 5),
(21, 'Room 21', 2, 1183000, 'WiFi,TV', 'Room 21 description.', 'room21.jpg', '123 Street 21', 'Hoạt động', '2025-08-16 18:52:38', 'Đã duyệt', 3, 6),
(22, 'Room 22', 5, 1830000, 'WiFi,TV', 'Room 22 description.', 'room22.jpg', '123 Street 22', 'Hoạt động', '2025-10-14 18:52:38', 'Đã duyệt', 4, 3),
(23, 'Room 23', 5, 527000, 'WiFi,TV', 'Room 23 description.', 'room23.jpg', '123 Street 23', 'Hoạt động', '2025-10-13 18:52:38', 'Đã duyệt', 5, 1),
(24, 'Room 24', 2, 1651000, 'WiFi,TV', 'Room 24 description.', 'room24.jpg', '123 Street 24', 'Hoạt động', '2025-10-04 18:52:38', 'Đã duyệt', 9, 6),
(25, 'Room 25', 5, 360000, 'WiFi,TV', 'Room 25 description.', 'room25.jpg', '123 Street 25', 'Hoạt động', '2025-09-19 18:52:38', 'Đã duyệt', 10, 9),
(26, 'Room 26', 3, 1421000, 'WiFi,TV', 'Room 26 description.', 'room26.jpg', '123 Street 26', 'Hoạt động', '2025-07-24 18:52:38', 'Đã duyệt', 7, 4),
(27, 'Room 27', 3, 687000, 'WiFi,TV', 'Room 27 description.', 'room27.jpg', '123 Street 27', 'Hoạt động', '2025-10-08 18:52:38', 'Đã duyệt', 4, 10),
(28, 'Room 28', 6, 682000, 'WiFi,TV', 'Room 28 description.', 'room28.jpg', '123 Street 28', 'Hoạt động', '2025-08-29 18:52:38', 'Đã duyệt', 3, 1),
(29, 'Room 29', 6, 1857000, 'WiFi,TV', 'Room 29 description.', 'room29.jpg', '123 Street 29', 'Hoạt động', '2025-07-16 18:52:38', 'Đã duyệt', 8, 10),
(30, 'Room 30', 6, 729000, 'WiFi,TV', 'Room 30 description.', 'room30.jpg', '123 Street 30', 'Hoạt động', '2025-09-17 18:52:38', 'Đã duyệt', 3, 6),
(31, 'Nha Trang Retreat 31', 5, 493000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng biển Trần Phú, có ban công. Phòng 31 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'nhatrang31.jpg', '27 Nha Trang Street', 'Hoạt động', '2025-09-22 18:53:49', 'Đã duyệt', 10, 7),
(32, 'Quy Nhơn Retreat 32', 2, 1369000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Resort xanh mát, gần biển Hoàng Hậu. Phòng 32 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'quynhơn32.jpg', '80 Quy Nhơn Street', 'Hoạt động', '2025-08-20 18:53:49', 'Đã duyệt', 8, 4),
(33, 'Đà Nẵng Retreat 33', 2, 1834000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng sát biển Mỹ Khê, tiện nghi hiện đại. Phòng 33 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đànẵng33.jpg', '75 Đà Nẵng Street', 'Hoạt động', '2025-08-27 18:53:49', 'Đã duyệt', 8, 10),
(34, 'Đà Lạt Retreat 34', 6, 2105000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng ấm cúng, view rừng thông. Phòng 34 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đàlạt34.jpg', '89 Đà Lạt Street', 'Hoạt động', '2025-09-03 18:53:49', 'Đã duyệt', 10, 2),
(35, 'Hà Nội Retreat 35', 5, 924000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng view phố cổ, gần Hồ Gươm. Phòng 35 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'hànội35.jpg', '80 Hà Nội Street', 'Hoạt động', '2025-10-15 18:53:49', 'Đã duyệt', 5, 6),
(36, 'Nha Trang Retreat 36', 4, 2388000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng biển Trần Phú, có ban công. Phòng 36 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'nhatrang36.jpg', '62 Nha Trang Street', 'Hoạt động', '2025-10-17 18:53:49', 'Đã duyệt', 7, 3),
(37, 'Đà Lạt Retreat 37', 3, 2862000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng ấm cúng, view rừng thông. Phòng 37 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đàlạt37.jpg', '12 Đà Lạt Street', 'Hoạt động', '2025-10-04 18:53:49', 'Đã duyệt', 8, 7),
(38, 'Đà Nẵng Retreat 38', 3, 2474000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng sát biển Mỹ Khê, tiện nghi hiện đại. Phòng 38 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đànẵng38.jpg', '89 Đà Nẵng Street', 'Hoạt động', '2025-09-23 18:53:49', 'Đã duyệt', 1, 3),
(39, 'Đà Nẵng Retreat 39', 5, 1172000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng sát biển Mỹ Khê, tiện nghi hiện đại. Phòng 39 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đànẵng39.jpg', '54 Đà Nẵng Street', 'Hoạt động', '2025-09-19 18:53:49', 'Đã duyệt', 3, 3),
(40, 'Đà Nẵng Retreat 40', 2, 2184000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng sát biển Mỹ Khê, tiện nghi hiện đại. Phòng 40 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đànẵng40.jpg', '28 Đà Nẵng Street', 'Hoạt động', '2025-10-01 18:53:49', 'Đã duyệt', 6, 2),
(41, 'Huế Retreat 41', 6, 1728000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng gần Đại Nội Huế, phong cách cổ. Phòng 41 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'huế41.jpg', '54 Huế Street', 'Hoạt động', '2025-10-03 18:53:49', 'Đã duyệt', 7, 2),
(42, 'Phú Quốc Retreat 42', 3, 483000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Bungalow riêng tư gần biển Dương Đông. Phòng 42 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'phúquốc42.jpg', '2 Phú Quốc Street', 'Hoạt động', '2025-09-12 18:53:49', 'Đã duyệt', 9, 6),
(43, 'Phú Quốc Retreat 43', 4, 2246000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Bungalow riêng tư gần biển Dương Đông. Phòng 43 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'phúquốc43.jpg', '73 Phú Quốc Street', 'Hoạt động', '2025-09-02 18:53:49', 'Đã duyệt', 6, 4),
(44, 'Phú Quốc Retreat 44', 5, 671000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Bungalow riêng tư gần biển Dương Đông. Phòng 44 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'phúquốc44.jpg', '88 Phú Quốc Street', 'Hoạt động', '2025-08-24 18:53:49', 'Đã duyệt', 2, 4),
(45, 'Phú Quốc Retreat 45', 5, 770000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Bungalow riêng tư gần biển Dương Đông. Phòng 45 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'phúquốc45.jpg', '76 Phú Quốc Street', 'Hoạt động', '2025-08-30 18:53:49', 'Đã duyệt', 10, 10),
(46, 'Quy Nhơn Retreat 46', 6, 1500000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Resort xanh mát, gần biển Hoàng Hậu. Phòng 46 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'quynhơn46.jpg', '5 Quy Nhơn Street', 'Hoạt động', '2025-10-12 18:53:49', 'Đã duyệt', 2, 6),
(47, 'Đà Lạt Retreat 47', 6, 799000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng ấm cúng, view rừng thông. Phòng 47 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đàlạt47.jpg', '70 Đà Lạt Street', 'Hoạt động', '2025-09-20 18:53:49', 'Đã duyệt', 2, 4),
(48, 'Đà Nẵng Retreat 48', 6, 858000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng sát biển Mỹ Khê, tiện nghi hiện đại. Phòng 48 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đànẵng48.jpg', '8 Đà Nẵng Street', 'Hoạt động', '2025-08-21 18:53:49', 'Đã duyệt', 2, 5),
(49, 'Phú Quốc Retreat 49', 3, 2415000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Bungalow riêng tư gần biển Dương Đông. Phòng 49 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'phúquốc49.jpg', '24 Phú Quốc Street', 'Hoạt động', '2025-10-10 18:53:49', 'Đã duyệt', 10, 1),
(50, 'Vũng Tàu Retreat 50', 4, 2168000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng gần Bãi Sau, ban công biển. Phòng 50 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'vũngtàu50.jpg', '87 Vũng Tàu Street', 'Hoạt động', '2025-08-25 18:53:49', 'Đã duyệt', 9, 8),
(51, 'Hà Nội Retreat 51', 2, 2538000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng view phố cổ, gần Hồ Gươm. Phòng 51 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'hànội51.jpg', '84 Hà Nội Street', 'Hoạt động', '2025-10-08 18:53:49', 'Đã duyệt', 7, 10),
(52, 'Đà Lạt Retreat 52', 6, 2598000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng ấm cúng, view rừng thông. Phòng 52 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đàlạt52.jpg', '72 Đà Lạt Street', 'Hoạt động', '2025-09-03 18:53:49', 'Đã duyệt', 2, 2),
(53, 'Quy Nhơn Retreat 53', 3, 2934000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Resort xanh mát, gần biển Hoàng Hậu. Phòng 53 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'quynhơn53.jpg', '79 Quy Nhơn Street', 'Hoạt động', '2025-10-06 18:53:49', 'Đã duyệt', 8, 2),
(54, 'Đà Lạt Retreat 54', 6, 990000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng ấm cúng, view rừng thông. Phòng 54 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'đàlạt54.jpg', '24 Đà Lạt Street', 'Hoạt động', '2025-09-11 18:53:49', 'Đã duyệt', 9, 1),
(55, 'Sapa Retreat 55', 2, 1758000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng hướng núi Fansipan, nhà gỗ ấm. Phòng 55 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'sapa55.jpg', '23 Sapa Street', 'Hoạt động', '2025-08-24 18:53:49', 'Đã duyệt', 5, 8),
(56, 'Quy Nhơn Retreat 56', 5, 451000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Resort xanh mát, gần biển Hoàng Hậu. Phòng 56 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'quynhơn56.jpg', '10 Quy Nhơn Street', 'Hoạt động', '2025-08-29 18:53:49', 'Đã duyệt', 7, 7),
(57, 'Vũng Tàu Retreat 57', 6, 2492000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng gần Bãi Sau, ban công biển. Phòng 57 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'vũngtàu57.jpg', '25 Vũng Tàu Street', 'Hoạt động', '2025-10-11 18:53:49', 'Đã duyệt', 4, 1),
(58, 'Phú Quốc Retreat 58', 2, 775000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Bungalow riêng tư gần biển Dương Đông. Phòng 58 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'phúquốc58.jpg', '30 Phú Quốc Street', 'Hoạt động', '2025-08-27 18:53:49', 'Đã duyệt', 9, 3),
(59, 'Hội An Retreat 59', 5, 1662000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Villa cổ kính, gần phố cổ Hội An. Phòng 59 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'hộian59.jpg', '82 Hội An Street', 'Hoạt động', '2025-10-11 18:53:49', 'Đã duyệt', 8, 2),
(60, 'Hà Nội Retreat 60', 6, 805000, 'WiFi,TV,Điều hòa,Nóng lạnh', 'Phòng view phố cổ, gần Hồ Gươm. Phòng 60 được thiết kế sang trọng và tiện nghi, phù hợp nghỉ dưỡng.', 'hànội60.jpg', '17 Hà Nội Street', 'Hoạt động', '2025-09-01 18:53:49', 'Đã duyệt', 9, 6),
(61, '123', 123, 123, NULL, '123', '123', NULL, 'Hoạt động', '2025-10-20 07:24:08', 'Chờ duyệt', 17, NULL);

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `Account`
--
ALTER TABLE `Account`
  ADD PRIMARY KEY (`accountId`);

--
-- Chỉ mục cho bảng `Address`
--
ALTER TABLE `Address`
  ADD PRIMARY KEY (`addressId`);

--
-- Chỉ mục cho bảng `Admin`
--
ALTER TABLE `Admin`
  ADD PRIMARY KEY (`adminId`),
  ADD KEY `accountId` (`accountId`);

--
-- Chỉ mục cho bảng `Booking`
--
ALTER TABLE `Booking`
  ADD PRIMARY KEY (`bookingId`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `roomId` (`roomId`);

--
-- Chỉ mục cho bảng `Customer`
--
ALTER TABLE `Customer`
  ADD PRIMARY KEY (`customerId`),
  ADD KEY `accountId` (`accountId`);

--
-- Chỉ mục cho bảng `Feedback`
--
ALTER TABLE `Feedback`
  ADD PRIMARY KEY (`feedbackId`),
  ADD KEY `providerId` (`providerId`),
  ADD KEY `reviewId` (`reviewId`);

--
-- Chỉ mục cho bảng `Invoice`
--
ALTER TABLE `Invoice`
  ADD PRIMARY KEY (`invoiceId`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `bookingId` (`bookingId`);

--
-- Chỉ mục cho bảng `PaymentInfo`
--
ALTER TABLE `PaymentInfo`
  ADD PRIMARY KEY (`paymentInfoId`),
  ADD KEY `providerId` (`providerId`);

--
-- Chỉ mục cho bảng `Provider`
--
ALTER TABLE `Provider`
  ADD PRIMARY KEY (`providerId`),
  ADD UNIQUE KEY `identityNumber` (`identityNumber`),
  ADD KEY `accountId` (`accountId`);

--
-- Chỉ mục cho bảng `Review`
--
ALTER TABLE `Review`
  ADD PRIMARY KEY (`reviewId`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `roomId` (`roomId`);

--
-- Chỉ mục cho bảng `Room`
--
ALTER TABLE `Room`
  ADD PRIMARY KEY (`roomId`),
  ADD KEY `providerId` (`providerId`),
  ADD KEY `addressId` (`addressId`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `Account`
--
ALTER TABLE `Account`
  MODIFY `accountId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT cho bảng `Address`
--
ALTER TABLE `Address`
  MODIFY `addressId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `Admin`
--
ALTER TABLE `Admin`
  MODIFY `adminId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT cho bảng `Booking`
--
ALTER TABLE `Booking`
  MODIFY `bookingId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `Customer`
--
ALTER TABLE `Customer`
  MODIFY `customerId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `Feedback`
--
ALTER TABLE `Feedback`
  MODIFY `feedbackId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `Invoice`
--
ALTER TABLE `Invoice`
  MODIFY `invoiceId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `PaymentInfo`
--
ALTER TABLE `PaymentInfo`
  MODIFY `paymentInfoId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `Provider`
--
ALTER TABLE `Provider`
  MODIFY `providerId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT cho bảng `Review`
--
ALTER TABLE `Review`
  MODIFY `reviewId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT cho bảng `Room`
--
ALTER TABLE `Room`
  MODIFY `roomId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=62;

--
-- Ràng buộc đối với các bảng kết xuất
--

--
-- Ràng buộc cho bảng `Admin`
--
ALTER TABLE `Admin`
  ADD CONSTRAINT `Admin_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `Account` (`accountId`);

--
-- Ràng buộc cho bảng `Booking`
--
ALTER TABLE `Booking`
  ADD CONSTRAINT `Booking_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`customerId`),
  ADD CONSTRAINT `Booking_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `Room` (`roomId`);

--
-- Ràng buộc cho bảng `Customer`
--
ALTER TABLE `Customer`
  ADD CONSTRAINT `Customer_ibfk_1` FOREIGN KEY (`accountId`) REFERENCES `Account` (`accountId`);

--
-- Ràng buộc cho bảng `Feedback`
--
ALTER TABLE `Feedback`
  ADD CONSTRAINT `Feedback_ibfk_1` FOREIGN KEY (`providerId`) REFERENCES `Provider` (`providerId`),
  ADD CONSTRAINT `Feedback_ibfk_2` FOREIGN KEY (`reviewId`) REFERENCES `Review` (`reviewId`);

--
-- Ràng buộc cho bảng `Invoice`
--
ALTER TABLE `Invoice`
  ADD CONSTRAINT `Invoice_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`customerId`),
  ADD CONSTRAINT `Invoice_ibfk_2` FOREIGN KEY (`bookingId`) REFERENCES `Booking` (`bookingId`);

--
-- Ràng buộc cho bảng `PaymentInfo`
--
ALTER TABLE `PaymentInfo`
  ADD CONSTRAINT `PaymentInfo_ibfk_1` FOREIGN KEY (`providerId`) REFERENCES `Provider` (`providerId`);

--
-- Ràng buộc cho bảng `Review`
--
ALTER TABLE `Review`
  ADD CONSTRAINT `Review_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `Customer` (`customerId`),
  ADD CONSTRAINT `Review_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `Room` (`roomId`);

--
-- Ràng buộc cho bảng `Room`
--
ALTER TABLE `Room`
  ADD CONSTRAINT `Room_ibfk_1` FOREIGN KEY (`providerId`) REFERENCES `Provider` (`providerId`),
  ADD CONSTRAINT `Room_ibfk_2` FOREIGN KEY (`addressId`) REFERENCES `Address` (`addressId`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
