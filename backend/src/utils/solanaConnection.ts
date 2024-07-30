import { Connection } from "@solana/web3.js";

export const connection = new Connection(
    `https://solana-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
    "finalized"
);
