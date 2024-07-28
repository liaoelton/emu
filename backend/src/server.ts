import { Connection, clusterApiUrl } from "@solana/web3.js";
import cors from "cors";
import "dotenv/config";
import express from "express";
import { findOrCreateBlockBySlot } from "./services/blockService";
import { connect_to_db } from "./utils/db";

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");
const app = express();
const port = 3001;

app.use(express.json());
app.use(cors());

app.get("/slot", async (req, res) => {
    try {
        const currentSlot = await connection.getSlot();
        res.json({ slot: currentSlot });
    } catch (error: any) {
        res.status(500).send(error.toString());
    }
});

app.get("/block/:slot", async (req, res) => {
    try {
        const slot = parseInt(req.params.slot, 10);
        if (isNaN(slot)) {
            res.status(400).send("Slot must be a number");
            return;
        }
        const blockInfo = await findOrCreateBlockBySlot(connection, slot);
        res.json({
            blockHeight: blockInfo.blockHeight,
            blockTime: blockInfo.blockTime,
            blockhash: blockInfo.blockhash,
            parentSlot: blockInfo.parentSlot,
            tx_sigs: blockInfo.tx_sigs,
            slot: blockInfo.slot,
        });
    } catch (error: any) {
        console.error("Failed to fetch or save block info:", error);
        res.status(500).send(error.toString());
    }
});

app.get("/blocks", async (req, res) => {
    try {
        const { end } = req.query;
        const endSlot = parseInt(end as string, 10);

        if (isNaN(endSlot)) {
            res.status(400).send("End slot must be a number");
            return;
        }

        const startSlot = endSlot - 5;
        let blocks = await connection.getBlocks(startSlot, endSlot);

        while (blocks.length < 5) {
            const additionalBlocks = await connection.getBlocks(startSlot - (5 - blocks.length), startSlot - 1);
            blocks = additionalBlocks.concat(blocks);
        }
        const detailedBlocks = [];
        for (let i = 0; i < Math.min(blocks.length, 5); i++) {
            const block = await findOrCreateBlockBySlot(connection, blocks[i]);
            detailedBlocks.push(block);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        const retDetails = detailedBlocks.map((block) => {
            return {
                blockHeight: block.blockHeight,
                blockTime: block.blockTime,
                blockhash: block.blockhash,
                slot: block.slot,
            };
        });
        res.json(retDetails);
    } catch (error: any) {
        console.error("Failed to fetch blocks:", error);
        res.status(500).send(error.toString());
    }
});

connect_to_db().then(() =>
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
);
