require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const paymentRoutes = require("./routes/paymentRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public"))); // FE ở thư mục public

app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(process.env.PORT, () => {
  console.log(`✅ Server started on port ${process.env.PORT}`);
});
