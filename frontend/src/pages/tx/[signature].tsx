import TxInfo from "@/components/tx/TxInfo";
import TxInstructions from "@/components/tx/TxInstructions";
import TxLogs from "@/components/tx/TxLogs";
import { Transaction } from "@/types/Transaction";
import { getTxInstructions } from "@/utils/txHelpers";
import { Flex, Grid, Text } from "@mantine/core";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Tx = () => {
    const router = useRouter();
    const { signature } = router.query;
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [ixs, setIxs] = useState<any[]>([]);
    const [programs, setPrograms] = useState<any>({});

    useEffect(() => {
        const updateTransactionData = async () => {
            if (transaction) {
                const { ixs, programs } = await getTxInstructions(transaction);
                setIxs(ixs);
                setPrograms(programs);
            }
        };

        updateTransactionData();
    }, [transaction]);

    useEffect(() => {
        if (signature) {
            const fetchBlockDetails = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/tx/${signature}`, {
                        headers: { "Content-Type": "application/json" },
                    });
                    const data: Transaction = response.data;
                    setTransaction(data);
                } catch (err: any) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        setError("An unknown error occurred");
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchBlockDetails();
        }
    }, [signature]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <Flex w="100%" direction="column" gap="md" mb="xl">
            <Text size="xl" fw={700} mb="md">
                Transaction Details
            </Text>
            <Grid className="dashboard-cards">
                {transaction && (
                    <>
                        <TxInfo signature={signature} transaction={transaction} />
                        <TxInstructions ixs={ixs} />
                        <TxLogs logs={transaction.meta.logMessages} programs={programs} />
                    </>
                )}
            </Grid>
        </Flex>
    );
};

export default Tx;
