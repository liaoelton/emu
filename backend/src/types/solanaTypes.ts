import { VersionedBlockResponse } from "@solana/web3.js";

export interface ExtendedBlockResponse extends VersionedBlockResponse {
    blockHeight: number;
    blockTime: number;
}
