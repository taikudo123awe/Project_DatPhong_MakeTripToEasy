const express = require("express");
const path = require("path");
const session = require("express-session");
const dotenv = require("dotenv");
const sequelize = require("./config/database");

// Load biến môi trường
dotenv.config();

// Khởi tạo Express
const app = express();

// Cấu hình view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Middleware cơ bản
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Cấu hình session
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

// Import routes
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const providerRoutes = require("./routes/providerRoutes");

// Áp dụng routes
app.use("/rooms", roomRoutes);
app.use("/provider", providerRoutes);
app.use("/", homeRoutes);
app.use(authRoutes);

// Kết nối DB & khởi động server
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
