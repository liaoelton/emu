import { VersionedBlockResponse, VersionedTransactionResponse } from "@solana/web3.js";

export interface ExtendedBlockResponse extends VersionedBlockResponse {
    blockHeight: number;
}