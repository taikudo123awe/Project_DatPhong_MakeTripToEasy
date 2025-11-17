import express from "express";
import { createPayment, vnpayReturn } from "../controllers/vnpayController.js";
const router = express.Router();

router.post("/create", createPayment);
router.get("/return", vnpayReturn);

export default router;
