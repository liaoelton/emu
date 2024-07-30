import axios from "axios";
import { useEffect, useState } from "react";

interface Block {
    blockHeight: string;
    blockTime: string;
    blockhash: string;
    parentSlot: number;
    slot: number;
    tx_sigs: string[][];
}

export const useBlock = (slot: number | null) => {
    const [block, setBlock] = useState<Block | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const getBlock = async (slot: number | null) => {
        if (!slot) return null;
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/blocks/${slot}`, {
                    headers: { "Content-Type": "application/json" },
                });

                return response.data;
            } catch (error: any) {
                console.log(error.response.data.error);
                if (error.response.data.error.includes("failed to get confirmed block: Block not available for slot")) {
                    attempts++;
                    if (attempts < maxRetries) {
                        console.log(`Retrying... (${attempts}/${maxRetries})`);
                        await new Promise((res) => setTimeout(res, 1000));
                    } else {
                        throw new Error("Failed to fetch block after multiple attempts.");
                    }
                } else {
                    throw new Error("Failed to fetch block.");
                }
            }
        }
    };

    useEffect(() => {
        const fetchBlock = async () => {
            try {
                setLoading(true);
                const blockData = await getBlock(slot);
                setBlock(blockData);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchBlock();
    }, [slot]);
    if (!slot) return { block, loading, error };

    return { block, loading, error };
};
