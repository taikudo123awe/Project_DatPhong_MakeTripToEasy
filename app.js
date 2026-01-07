const express = require("express");
const dotenv = require("dotenv");
const sequelize = require("./config/database");
dotenv.config();
const app = express();

const path = require("path");
require("dotenv").config();
const session = require("express-session");
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const roomRoutes = require("./routes/roomRoutes");
const providerRoutes = require("./routes/providerRoutes");
const customerRoutes = require("./routes/customerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const reportRoutes = require("./routes/reportRoutes");
const setLocals = require('./middlewares/setLocals');

require("./models/associations");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: true,
  })
);

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

app.use((req, res, next) => {
  res.locals.customer = req.session.customer || null;
  next();
});

app.use(setLocals);
app.use("/admin", require("./routes/adminRoutes"));
app.use("/rooms", roomRoutes);
app.use("/", homeRoutes);
app.use(authRoutes);
app.use("/provider", providerRoutes);
app.use("/customer", customerRoutes);
app.use("/customer/bookings", bookingRoutes);
app.use("/provider/report", reportRoutes);

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/terms", (req, res) => {
  res.render("terms");
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.use((req, res) => {
  const url = req.originalUrl;

  // Gợi ý đường dẫn gần đúng
  const suggestions = [
    "/",
    "/rooms",
    "/customer/login",
    "/provider/login",
    "/customer/history",
    "/provider/dashboard"
  ];

  res.status(404).render("404", {
    url,
    suggestions
  });
});

sequelize.sync().then(() => {
  app.listen(3000, () =>
    console.log("Server running on http://localhost:3000")
  );
});
