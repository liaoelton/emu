import mongoose, { Document, Schema } from "mongoose";

interface ITransaction extends Document {
    signatures: string[];
    slot: number;
    blockTime: string | null;
    meta: {
        computeUnitsConsumed: number;
        err: any | null;
        fee: number;
        innerInstructions: any[];
        loadedAddresses: any[];
        logMessages: string[];
        postBalances: number[];
        postTokenBalances: any[];
        preBalances: number[];
        preTokenBalances: any[];
        rewards: any[];
        status: any;
    };
    transaction: {
        message: {
            header: {
                numReadonlySignedAccounts: number;
                numReadonlyUnsignedAccounts: number;
                numRequiredSignatures: number;
            };
            accountKeys: string[];
            recentBlockhash: string;
            staticAccountKeys: any[];
            compiledInstructions: any[];
            addressTableLookups: any[];
            instructions: any[];
        };
        signatures: string[];
    };
    version: any;
}

const transactionSchema = new Schema<ITransaction>({
    signatures: { type: [String], required: true, unique: true },
    slot: { type: Number, required: true },
    blockTime: { type: String, required: false },
    meta: {
        computeUnitsConsumed: { type: Number, required: true },
        err: { type: Schema.Types.Mixed, required: false },
        fee: { type: Number, required: true },
        innerInstructions: { type: [Schema.Types.Mixed], required: true },
        loadedAddresses: { type: [Schema.Types.Mixed], required: true },
        logMessages: { type: [String], required: true },
        postBalances: { type: [Number], required: true },
        postTokenBalances: { type: [Schema.Types.Mixed], required: true },
        preBalances: { type: [Number], required: true },
        preTokenBalances: { type: [Schema.Types.Mixed], required: true },
        rewards: { type: [Schema.Types.Mixed], required: true },
        status: { type: Schema.Types.Mixed, required: true },
    },
    transaction: {
        message: {
            header: {
                numReadonlySignedAccounts: { type: Number, required: true },
                numReadonlyUnsignedAccounts: { type: Number, required: true },
                numRequiredSignatures: { type: Number, required: true },
            },
            accountKeys: { type: [String], required: true },
            recentBlockhash: { type: String, required: true },
            staticAccountKeys: { type: [Schema.Types.Mixed], required: true },
            compiledInstructions: { type: [Schema.Types.Mixed], required: true },
            addressTableLookups: { type: [Schema.Types.Mixed], required: true },
            instructions: { type: [Schema.Types.Mixed], required: true },
        },
        signatures: { type: [String], required: true },
    },
    version: { type: Schema.Types.Mixed, required: true },
});

const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
export default Transaction;
