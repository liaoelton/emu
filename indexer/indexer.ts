import { Connection } from "@solana/web3.js";
import "dotenv/config";
import mongoose from "mongoose";

const blockHashSchema = new mongoose.Schema({
    slot: { type: Number, required: true, unique: true },
    blockhash: { type: String, required: true, unique: true },
    parentSlot: { type: Number, required: true, unique: true },
});

const BlockHashModel = mongoose.model("BlockHash", blockHashSchema);

const connection = new Connection(
    `https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    "finalized"
);

const connect_to_db = async () => {
    mongoose.connection.on("connecting", () => console.log("Connecting to MongoDB..."));
    mongoose.connection.on("error", (error) => console.error("Connection error:", error));
    mongoose.connection.once("open", () => console.log("Connected to MongoDB"));

    try {
        await mongoose.connect(process.env.MONGO_URL || "mongodb://localhost:27017/solana-block-explorer", {});
    } catch (error) {
        console.error("Failed to connect to MongoDB:", error);
    }
};

async function fetchAndStoreSlotBlockhash(startSlot?: number) {
    try {
        let slot = startSlot || (await connection.getSlot());

        while (slot !== null) {
            const existingSlot = await BlockHashModel.findOne({ slot });
            if (existingSlot) {
                console.log(`Slot ${slot} already exists in the database.`);
                if (typeof existingSlot.parentSlot === "number") {
                    slot = existingSlot.parentSlot;
                    continue;
                }
            }
            let block;
            let attempts = 0;
            const maxAttempts = 5;

            while (attempts < maxAttempts) {
                try {
                    block = await connection.getBlock(slot, {
                        transactionDetails: "none",
                        maxSupportedTransactionVersion: 0,
                        rewards: false,
                    });
                    if (block) break;
                } catch (error) {
                    console.error(`Attempt ${attempts + 1} failed:`, error);
                }
                attempts++;
                if (attempts < maxAttempts) {
                    console.log(`Retrying... (${attempts + 1}/${maxAttempts})`);
                }
            }

            if (!block) {
                console.log(`No block found for slot ${slot}`);
                break;
            }
            const blockHashDocument = new BlockHashModel({
                slot,
                blockhash: block.blockhash,
                parentSlot: block.parentSlot,
            });
            await blockHashDocument.save();
            console.log(`Stored slot ${slot} with blockhash ${block?.blockhash}`);

            if (!block.parentSlot) {
                console.log(`No parentSlot found for slot ${slot}`);
                break;
            }
            slot = block.parentSlot;
        }
    } catch (error) {
        console.error("Failed to fetch or store slot-blockhash:", error);
    }
}

async function startIndexer(startSlot?: number) {
    await connect_to_db();
    await fetchAndStoreSlotBlockhash(startSlot);
}

startIndexer();
