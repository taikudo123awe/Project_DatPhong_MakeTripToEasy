import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from "vnpay";
import Booking from "../models/Booking.js";
import Transaction from "../models/Transaction.js";
import dotenv from "dotenv";
dotenv.config();

export const createPayment = async (req, res) => {
  try {
    const { code } = req.body;
    const booking = await Booking.findOne({ where: { code } });

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "paid")
      return res.status(400).json({ message: "Already paid" });

    // Cấu hình VNPay
    const vnpay = new VNPay({
      tmnCode: process.env.TMNCODE,
      secureSecret: process.env.SECURESECRET,
      vnpayHost: "https://sandbox.vnpayment.vn",
      testMode: true,
      hashAlgorithm: "SHA512",
      loggerFn: ignoreLogger,
    });

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const payUrl = await vnpay.buildPaymentUrl({
      vnp_Amount: booking.totalAmount * 100,
      vnp_IpAddr: req.ip || "127.0.0.1",
      vnp_TxnRef: `${code}-${Date.now()}`,
      vnp_OrderInfo: `Thanh toán đơn đặt phòng ${code}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: `${process.env.BACKEND_URL}/vnpay/return`,
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    await Transaction.create({
      bookingCode: code,
      amount: booking.totalAmount,
      paymentUrl: payUrl,
      status: "pending",
    });

    return res.json({ payUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const vnpayReturn = async (req, res) => {
  try {
    const code = req.query.vnp_TxnRef.split("-")[0];
    const success = req.query.vnp_ResponseCode === "00";

    if (success) {
      await Transaction.update(
        { status: "paid", responseCode: "00" },
        { where: { bookingCode: code } }
      );

      await Booking.update(
        { status: "paid", paymentMethod: "vnpay" },
        { where: { code } }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-success/${code}`
      );
    } else {
      await Transaction.update(
        {
          status: "failed",
          responseCode: req.query.vnp_ResponseCode,
          bankCode: req.query.vnp_BankCode,
          transactionNo: req.query.vnp_TransactionNo,
        },
        { where: { bookingCode: code } }
      );

      return res.redirect(
        `${process.env.FRONTEND_URL}/payment-fail/${code}`
      );
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
