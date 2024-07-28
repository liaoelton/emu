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
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/block/${slot}`, {
                headers: { "Content-Type": "application/json" },
            });

            return response.data;
        } catch (error: any) {
            console.error(error);
            throw new Error("Failed to fetch block.");
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
