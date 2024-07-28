import mongoose, { Document, Schema } from "mongoose";

export interface IBlock extends Document {
    blockHeight: string;
    blockTime: string | null;
    blockhash: string;
    parentSlot: number;
    tx_sigs: String[][];
    slot: number;
}

const blockSchema = new Schema<IBlock>({
    blockHeight: { type: String, required: true },
    blockTime: { type: String, required: false },
    blockhash: { type: String, unique: true, required: true },
    parentSlot: { type: Number, required: true },
    tx_sigs: { type: [[String]], required: true },
    slot: { type: Number, required: true },
});

const Block = mongoose.model<IBlock>("Block", blockSchema);
export default Block;
