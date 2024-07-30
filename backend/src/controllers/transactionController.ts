import { Request, Response } from "express";
import { findOrCreateBlockBySlot } from "../services/blockService";
import { findOrCreateTransactionBySignature } from "../services/txService";
import { connection } from "../utils/solanaConnection";

export const getTransaction = async (req: Request, res: Response) => {
    try {
        const signature = req.params.signature;
        const isBase58 = /^[1-9A-HJ-NP-Za-km-z]+$/.test(signature);
        if (!isBase58) {
            res.status(400).send("Signature must be in base 58");
            return;
        }
        const transaction = await findOrCreateTransactionBySignature(connection, signature);
        res.json(transaction);
    } catch (error: any) {
        console.error("Failed to fetch or save transaction info:", error);
        res.status(500).json({ error: error.toString() });
    }
};

export const getTransactions = async (req: Request, res: Response) => {
    try {
        const { block, page = 1, limit = 10 } = req.query;
        const blockSlot = Number(block);
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        if (isNaN(blockSlot) || isNaN(pageNumber) || isNaN(limitNumber) || pageNumber <= 0 || limitNumber <= 0) {
            return res.status(400).json({ error: "Block slot, page, and limit must be valid positive numbers" });
        }

        const blockInfo = await findOrCreateBlockBySlot(connection, blockSlot);
        const txs = blockInfo?.tx_sigs || [];
        const totalTxs = txs.length;
        const totalPages = Math.ceil(totalTxs / limitNumber);

        if (pageNumber > totalPages) {
            return res.status(400).json({ error: "Page number exceeds total pages" });
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
        res.status(500).json({ error: error.message });
    }
};
