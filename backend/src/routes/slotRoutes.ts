import express from "express";
import { getCurrentSlot } from "../controllers/slotController";

const router = express.Router();

router.get("/", getCurrentSlot);

export default router;
