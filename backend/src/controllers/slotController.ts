import { Request, Response } from "express";
import { connection } from "../utils/solanaConnection";

export const getCurrentSlot = async (req: Request, res: Response) => {
    try {
        const currentSlot = await connection.getSlot({ commitment: "finalized" });
        res.json({ slot: currentSlot });
    } catch (error: any) {
        res.status(500).json({ error: error.toString() });
    }
};
