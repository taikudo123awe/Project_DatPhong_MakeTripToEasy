const axios = require("axios");

// === TẠO MÃ THANH TOÁN ===
exports.createPayment = async (req, res) => {
  try {
    const { bookingId, amount, customerName } = req.body;

    const payload = {
      orderCode: bookingId,
      amount: amount,
      description: `Thanh toan phong #${bookingId} - ${customerName}`,
      cancelUrl: "http://localhost:3000/payment/cancel",
      returnUrl: "http://localhost:3000/payment/success",
    };

    const headers = {
      "x-client-id": process.env.PAYOS_CLIENT_ID,
      "x-api-key": process.env.PAYOS_API_KEY,
      "Content-Type": "application/json",
    };

    const { data } = await axios.post(
      "https://api-merchant.payos.vn/v2/payment-requests",
      payload,
      { headers }
    );

    res.json({
      checkoutUrl: data.data.checkoutUrl,
      qrCode: data.data.qrCode, // mã QR dạng base64
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to create payment" });
  }
};

// === XỬ LÝ WEBHOOK (PayOS gọi khi thanh toán thành công) ===
exports.handleWebhook = async (req, res) => {
  try {
    const { orderCode, status } = req.body;

    if (status === "PAID") {
      console.log(`✅ Booking #${orderCode} đã thanh toán thành công!`);
      // Ở đây bạn có thể cập nhật DB (nếu có)
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
};
