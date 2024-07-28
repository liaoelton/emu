import axios from "axios";
import { useEffect, useState } from "react";

export const useSlot = () => {
    const [slot, setSlot] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const getSlot = async () => {
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/slot`, {
                headers: { "Content-Type": "application/json" },
            });

            return response.data.slot;
        } catch (error: any) {
            console.error(error);
            throw new Error("Failed to fetch slot.");
        }
    };
    useEffect(() => {
        const fetchSlot = async () => {
            try {
                setLoading(true);
                const slotData = await getSlot();
                setSlot(slotData);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchSlot();
        const interval = setInterval(fetchSlot, 20000);

        return () => clearInterval(interval);
    }, []);

    return { slot, loading, error };
};
