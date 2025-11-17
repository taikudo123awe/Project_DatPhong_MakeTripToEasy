import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./config/database.js";
import Booking from "./models/Booking.js";
import Transaction from "./models/Transaction.js";
import vnpayRoutes from "./routes/vnpayRoutes.js";

dotenv.config();
const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Routes
app.use("/vnpay", vnpayRoutes);

// Trang chủ hiển thị danh sách booking
app.get("/", async (req, res) => {
  const bookings = await Booking.findAll({ order: [["id", "DESC"]] });
  res.render("index", { bookings });
});

// Tạo booking mẫu
app.get("/create-booking", async (req, res) => {
  const booking = await Booking.create({
    code: "BOOK" + Date.now(),
    customerName: "Nguyen Van A",
    totalAmount: 50000 + Math.floor(Math.random() * 50000),
  });
  res.redirect("/");
});

// Trang kết quả
app.get("/payment-success/:code", (req, res) => {
  res.render("success", { code: req.params.code });
});
app.get("/payment-fail/:code", (req, res) => {
  res.render("fail", { code: req.params.code });
});

// Sync DB
sequelize.sync({ alter: true }).then(() => {
  console.log("✅ Database synced!");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
