import { NextFunction, Request, Response } from "express";
import { formatBlockResponse, retryFetchBlock } from "../services/blockService";
import { ValidationError } from "../utils/errors";
import { connection } from "../utils/solanaConnection";

export const getBlock = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const slot = parseInt(req.params.slot, 10);
        if (isNaN(slot)) {
            throw new ValidationError("Slot must be a number");
        }
        const block = await retryFetchBlock(slot, connection);
        res.json(block);
    } catch (error: any) {
        console.error("Failed to fetch or save block info:", error);
        next(error);
    }
};

export const getBlocks = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { end, limit = 5 } = req.query;
        const endSlot = parseInt(end as string, 10);
        const blockLimit = parseInt(limit as string, 10);
        const threshold = 5; // For non-contiguous slots

        if (isNaN(endSlot)) {
            throw new ValidationError("End slot must be a number");
        }

        if (isNaN(blockLimit) || blockLimit <= 0) {
            throw new ValidationError("Limit must be a positive number");
        }

        const startSlot = endSlot - blockLimit - threshold;
        const blocks = await connection.getBlocks(startSlot, endSlot);

        const detailedBlocks = await Promise.all(
            blocks.slice(-(blockLimit + 1)).map(async (blockSlot) => {
                try {
                    const block = await retryFetchBlock(blockSlot, connection);
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
        next(error);
    }
};
