import { Connection } from "@solana/web3.js";
import Block, { IBlock } from "../models/block";
import { ExtendedBlockResponse } from "../types/solanaTypes";

export const formatBlockResponse = (block: IBlock) => {
    const { blockHeight, blockTime, blockhash, parentSlot, slot, tx_sigs } = block;
    return {
        blockHeight,
        blockTime,
        blockhash,
        parentSlot,
        slot,
        tx_sigs,
    };
};

export const findOrCreateBlockBySlot = async (connection: Connection, slot: number): Promise<any> => {
    console.log("Checking DB for block at slot", slot);
    let blockInfo = await Block.findOne({ slot }).exec();

    if (blockInfo) {
        console.log("Block found in DB");
        return formatBlockResponse(blockInfo);
    }

    console.log("No block found in DB, fetching from RPC");
    const details = (await connection.getBlock(slot, {
        maxSupportedTransactionVersion: 0,
    })) as ExtendedBlockResponse;

    if (!details) {
        throw new Error("Block not found");
    }

    // TODO: Define the attributes for transactions that need to be saved
    const blockData: Partial<IBlock> = {
        blockHeight: details.blockHeight.toString(),
        blockTime: details.blockTime ? new Date(details.blockTime * 1000).toISOString() : null,
        blockhash: details.blockhash,
        parentSlot: details.parentSlot,
        slot,
        tx_sigs: details.transactions.map((tx) => tx.transaction.signatures),
    };

    blockInfo = new Block(blockData);
    await blockInfo.save();

    return formatBlockResponse(blockInfo);
};
