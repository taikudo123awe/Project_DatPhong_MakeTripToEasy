import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  bookingCode: { type: DataTypes.STRING, allowNull: false },
  amount: { type: DataTypes.INTEGER, allowNull: false },
  paymentUrl: { type: DataTypes.TEXT },
  status: { type: DataTypes.STRING, defaultValue: "pending" },
  responseCode: { type: DataTypes.STRING },
  bankCode: { type: DataTypes.STRING },
  transactionNo: { type: DataTypes.STRING },
});

export default Transaction;
