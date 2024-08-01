import { PublicKey } from "@solana/web3.js";
import { NextFunction, Request, Response } from "express";
import BlockHashModel from "../models/blockHash";
import { fetchBlockWithRetries } from "../services/blockService";
import { findOrCreateTransactionBySignature } from "../services/txService";
import { NotFoundError, ValidationError } from "../utils/errors";
import { connection } from "../utils/solanaConnection";

export const search = async (req: Request, res: Response, next: NextFunction) => {
    const { query } = req.params;
    const slot = parseInt(query, 10);

    if (/^\d+$/.test(query)) {
        try {
            // TODO: Handle unconfirmed blocks
            const blockInfo = await fetchBlockWithRetries(slot, connection);
            res.json({ type: "block", data: blockInfo });
        } catch (error: any) {
            console.error("Error fetching block:", error);
            next(error);
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
        } catch (error: any) {
            console.error("Error fetching transaction:", error);
        }

        try {
            // TODO: Handle unconstructed accounts
            const addressInfo = await connection.getAccountInfo(new PublicKey(query));
            if (addressInfo) {
                res.json({ type: "address", data: addressInfo });
                return;
            }
        } catch (error: any) {
            console.error("Error fetching address info:", error);
        }

        try {
            const blockHashDocument = await BlockHashModel.findOne({ blockhash: query });
            if (blockHashDocument) {
                const blockInfo = await fetchBlockWithRetries(blockHashDocument.slot, connection);
                res.json({ type: "block", data: blockInfo });
                return;
            }
        } catch (error: any) {
            console.error("Error fetching block by hash:", error);
        }

        next(new NotFoundError("Block, transaction, or address not found"));
        return;
    }

    next(new ValidationError("Query format not recognized as a slot or base58 encoded string"));
};
