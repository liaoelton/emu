import { NextFunction, Request, Response } from "express";
import { fetchBlockWithRetries } from "../services/blockService";
import { findOrCreateTransactionBySignature } from "../services/txService";
import { ValidationError } from "../utils/errors";
import { connection } from "../utils/solanaConnection";

export const getTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const signature = req.params.signature;
        const isBase58 = /^[1-9A-HJ-NP-Za-km-z]+$/.test(signature);
        if (!isBase58) {
            throw new ValidationError("Signature must be in base 58");
        }
        const transaction = await findOrCreateTransactionBySignature(connection, signature);
        res.json(transaction);
    } catch (error: any) {
        console.error("Failed to fetch or save transaction info:", error);
        next(error);
    }
};

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { block, page = 1, limit = 10 } = req.query;
        const blockSlot = Number(block);
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (isNaN(blockSlot) || isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
            throw new ValidationError("Block slot, page, and limit must be valid positive numbers");
        }

        const blockInfo = await fetchBlockWithRetries(blockSlot, connection);
        const txs = blockInfo?.tx_sigs || [];
        const totalTxs = txs.length;
        const totalPages = Math.ceil(totalTxs / limitNumber);

        if (pageNumber > totalPages) {
            throw new ValidationError("Page number exceeds total pages");
        }

        const txsPaged = txs.slice((pageNumber - 1) * limitNumber, pageNumber * limitNumber);

        const transactions = await Promise.all(
            txsPaged.map(async (txSig: any) => {
                const tx = await findOrCreateTransactionBySignature(connection, txSig[0]);
                return tx;
            })
        );

        const meta = {
            total: totalTxs,
            page: pageNumber,
            limit: limitNumber,
            totalPages: totalPages,
        };

        res.json({
            transactions,
            meta,
        });
    } catch (error: any) {
        console.error("Failed to fetch or save transaction info:", error);
        next(error);
    }
};
