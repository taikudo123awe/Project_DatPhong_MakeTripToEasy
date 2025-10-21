const express = require("express");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const sequelize = require("./config/database");

dotenv.config();

const app = express();

// ====== View Engine ======
app.set("view engine", "ejs");
app.set("views", path.resolve(__dirname, "views"));

// ====== Middleware ======
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ====== Session ======
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// ====== Import Routes ======
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const providerRoutes = require("./routes/providerRoutes");

// ====== Apply Routes ======
app.use("/", homeRoutes); // Trang chủ
app.use("/rooms", roomRoutes); // Cho khách xem phòng
app.use("/provider", providerRoutes); // Cho nhà cung cấp quản lý
app.use(authRoutes); // Đăng nhập, đăng ký

// ====== Trang test API địa chỉ ======
app.get("/test", (req, res) => {
  res.render("test"); // views/test.ejs
});

// ====== Khởi động server ======
sequelize
  .sync()
  .then(() => {
    app.listen(3000, () => {
      console.log("🚀 Server running on http://localhost:3000");
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
