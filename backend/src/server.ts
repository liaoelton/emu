import { Connection, PublicKey } from "@solana/web3.js";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { findOrCreateBlockBySlot, formatBlockResponse } from "./services/blockService";
import { findOrCreateTransactionBySignature } from "./services/txService";
import { connect_to_db } from "./utils/db";

const connection = new Connection(`https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`);

const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get("/slot", async (req, res) => {
    try {
        const currentSlot = await connection.getSlot();
        res.json({ slot: currentSlot });
    } catch (error: any) {
        res.status(500).json({ error: error.toString() });
    }
});

app.get("/block/:slot", async (req, res) => {
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
});

app.get("/blocks", async (req, res) => {
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
            blocks.slice(-blockLimit).map(async (blockSlot) => {
                const block = await findOrCreateBlockBySlot(connection, blockSlot);
                return block;
            })
        );

        const formattedBlocks = detailedBlocks.map(formatBlockResponse);
        res.json(formattedBlocks);
    } catch (error: any) {
        console.error("Failed to fetch blocks:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get("/tx/:signature", async (req, res) => {
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
});

app.get("/search/:query", async (req, res) => {
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
});

connect_to_db().then(() =>
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
);
