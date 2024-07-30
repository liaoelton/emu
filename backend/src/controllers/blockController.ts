import { Request, Response } from "express";
import { findOrCreateBlockBySlot, formatBlockResponse } from "../services/blockService";
import { connection } from "../utils/solanaConnection";

export const getBlock = async (req: Request, res: Response) => {
    try {
        const slot = parseInt(req.params.slot, 10);
        if (isNaN(slot)) {
            res.status(400).send("Slot must be a number");
            return;
        }
        const block = await findOrCreateBlockBySlot(connection, slot);
        res.json(block);
    } catch (error: any) {
        console.error("Failed to fetch or save block info:", error);
        res.status(500).json({ error: error.toString() });
    }
};

export const getBlocks = async (req: Request, res: Response) => {
    try {
        const { end, limit = 5 } = req.query;
        const endSlot = parseInt(end as string, 10);
        const blockLimit = parseInt(limit as string, 10);
        const threshold = 5; // For non-contiguous slots

        if (isNaN(endSlot)) {
            return res.status(400).json({ error: "End slot must be a number" });
        }

        if (isNaN(blockLimit) || blockLimit <= 0) {
            return res.status(400).json({ error: "Limit must be a positive number" });
        }

        const startSlot = endSlot - blockLimit - threshold;
        const blocks = await connection.getBlocks(startSlot, endSlot);

        const detailedBlocks = await Promise.all(
            blocks.slice(-(blockLimit + 1)).map(async (blockSlot) => {
                try {
                    const block = await findOrCreateBlockBySlot(connection, blockSlot);
                    return block;
                } catch (error) {
                    console.error(`Failed to fetch or save block info for slot ${blockSlot}:`, error);
                    return null;
                }
            })
        ).then((results) => results.filter((block) => block !== null));

        const formattedBlocks = detailedBlocks.slice(-blockLimit).map(formatBlockResponse);
        res.json(formattedBlocks);
    } catch (error: any) {
        console.error("Failed to fetch blocks:", error);
        res.status(500).json({ error: error.message });
    }
};
