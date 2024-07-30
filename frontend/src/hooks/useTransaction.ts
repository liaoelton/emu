import { Transaction } from "@/types/Transaction";
import axios from "axios";
import { useEffect, useState } from "react";

export const useTransaction = (signature: string | null) => {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const getTransaction = async (signature: string | null) => {
        if (!signature) return null;
        const maxRetries = 3;
        let attempts = 0;

        while (attempts < maxRetries) {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/tx/${signature}`, {
                    headers: { "Content-Type": "application/json" },
                });

                return response.data;
            } catch (error: any) {
                console.error(error.response.data.error);
                throw new Error("Failed to fetch transaction.", error.message);
            }
        }
    };

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                setLoading(true);
                const transactionData = await getTransaction(signature);
                setTransaction(transactionData);
                setLoading(false);
            } catch (err: any) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [signature]);
    if (!signature) return { transaction, loading, error };

    return { transaction, loading, error };
};
