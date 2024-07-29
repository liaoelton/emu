export interface Block {
    slot: number;
    blockHeight: string;
    blockTime: string;
    blockhash: string;
    parentSlot?: number;
    tx_sigs?: string[][];
}
