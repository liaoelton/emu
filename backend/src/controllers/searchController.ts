import { PublicKey } from "@solana/web3.js";
import { Request, Response } from "express";
import { findOrCreateBlockBySlot } from "../services/blockService";
import { findOrCreateTransactionBySignature } from "../services/txService";
import { connection } from "../utils/solanaConnection";

export const search = async (req: Request, res: Response) => {
    const { query } = req.params;
    const slot = parseInt(query, 10);

    if (/^\d+$/.test(query)) {
        try {
            // TODO: Handle uncomfirmed blocks
            const blockInfo = await findOrCreateBlockBySlot(connection, slot);
            res.json({ type: "block", data: blockInfo });
        } catch (error: any) {
            console.error("Error fetching block:", error);
            res.status(500).json({ error: error.message });
        }
        return;
    }
    // Check if it's base58 encoded (signature, account, or program)
    if (/^[1-9A-HJ-NP-Za-km-z]+$/.test(query)) {
        try {
            const transaction = await findOrCreateTransactionBySignature(connection, query);
            if (transaction) {
                res.json({ type: "transaction", data: transaction });
                return;
            }
        } catch (error) {
            console.error("Error fetching transaction:", error);
        }

        try {
            // TODO: Handle unconstructed accounts
            const addressInfo = await connection.getAccountInfo(new PublicKey(query));
            if (addressInfo) {
                res.json({ type: "address", data: addressInfo });
                return;
            }
        } catch (error) {
            console.error("Error fetching address info:", error);
        }

        res.status(404).json({ type: "error", error: "Block, transaction, or address not found" });
        return;
    }

    res.status(400).json({ error: "Query format not recognized as a slot or base58 encoded string" });
};
