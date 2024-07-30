import express from "express";
import { getTransaction, getTransactions } from "../controllers/transactionController";

const router = express.Router();

router.get("/:signature", getTransaction);
router.get("/", getTransactions);

export default router;
