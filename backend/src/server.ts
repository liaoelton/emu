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

connect_to_db().then(() =>
    app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
    })
);
