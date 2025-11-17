import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Booking = sequelize.define("Booking", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING, allowNull: false, unique: true },
  customerName: { type: DataTypes.STRING, allowNull: false },
  totalAmount: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  paymentMethod: { type: DataTypes.STRING },
});

export default Booking;
