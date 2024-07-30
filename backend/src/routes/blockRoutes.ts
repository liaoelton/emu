import express from "express";
import { getBlock, getBlocks } from "../controllers/blockController";

const router = express.Router();

router.get("/:slot", getBlock);
router.get("/", getBlocks);

export default router;
