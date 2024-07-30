import mongoose, { Document, Schema } from "mongoose";

export interface IBlockHash extends Document {
    slot: number;
    blockhash: string;
    parentSlot: number;
}

const blockHashSchema = new Schema<IBlockHash>({
    slot: { type: Number, required: true },
    blockhash: { type: String, required: true },
    parentSlot: { type: Number, required: true },
});

const BlockHashModel = mongoose.model<IBlockHash>("BlockHash", blockHashSchema);
export default BlockHashModel;
