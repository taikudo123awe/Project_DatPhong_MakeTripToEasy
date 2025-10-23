

CREATE TABLE `Account` (
  `accountId` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` int(11) NOT NULL,
  `status` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


--
-- Cấu trúc bảng cho bảng `Address`
--

CREATE TABLE `Address` (
  `addressId` int(11) NOT NULL,
  `city` varchar(58) DEFAULT NULL,
  `district` varchar(58) DEFAULT NULL,
  `ward` varchar(58) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


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
-- Cấu trúc bảng cho bảng `Room`
--

CREATE TABLE `Room` (
  `roomId` int(11) NOT NULL,
  `roomName` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT NULL,
  `price` float DEFAULT NULL,
  `amenities` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `image` text DEFAULT NULL,
  `fullAddress` varchar(255) DEFAULT NULL,
  `status` varchar(30) DEFAULT NULL,
  `postedAt` datetime DEFAULT NULL,
  `approvalStatus` varchar(30) DEFAULT NULL,
  `providerId` int(11) DEFAULT NULL,
  `addressId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


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
