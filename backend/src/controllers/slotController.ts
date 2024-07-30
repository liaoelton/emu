import { NextFunction, Request, Response } from "express";
import { connection } from "../utils/solanaConnection";

export const getCurrentSlot = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const currentSlot = await connection.getSlot({ commitment: "finalized" });
        res.json({ slot: currentSlot });
    } catch (error: any) {
        console.error("Failed to fetch current slot:", error);
        next(error);
    }
};
