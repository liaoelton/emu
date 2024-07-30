import TxInfo from "@/components/tx/TxInfo";
import TxInstructions from "@/components/tx/TxInstructions";
import TxLogs from "@/components/tx/TxLogs";
import { Transaction } from "@/types/Transaction";
import { parseTransaction } from "@/utils/parsing";
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
        const fetchDecodedData = async () => {
            if (!transaction) return;
            try {
                const accountKeys = transaction.transaction.message.accountKeys;
                let ixIndex = 0;
                let ixs: any[] = [];
                let programs = {};
                for (const instruction of transaction.transaction.message.instructions) {
                    const parsedResult = await parseTransaction(
                        accountKeys[instruction.programIdIndex],
                        instruction.data
                    );
                    let SFMIdlItem = null;
                    let decodedData = null;
                    if (parsedResult) {
                        SFMIdlItem = parsedResult.SFMIdlItem;
                        decodedData = parsedResult.decodedData;
                    }
                    programs = {
                        ...programs,
                        [SFMIdlItem?.programId as string]: SFMIdlItem?.idl.name as string
                    };
                    decodedData = {
                        ...decodedData,
                        index: ixIndex,
                        accounts: instruction.accounts.map((accountIndex: number) => accountKeys[accountIndex]),
                        data: decodedData?.data,
                        name: decodedData?.name,
                        idl_name: SFMIdlItem?.idl.name,
                        idl_program_id: SFMIdlItem?.programId,
                    } as any;

                    if (transaction.meta.innerInstructions.map((inner: any) => inner.index).includes(ixIndex)) {
                        let inner_ixs: any[] = [];
                        for (const inner of transaction.meta.innerInstructions) {
                            for (const inner_ix of inner.instructions) {
                                const innerParsedResult = await parseTransaction(
                                    accountKeys[inner_ix.programIdIndex],
                                    inner_ix.data
                                );
                                let innerDecodedData = null;
                                let innerSFMIdlItem = null;
                                if (innerParsedResult) {
                                    innerDecodedData = innerParsedResult.decodedData;
                                    innerSFMIdlItem = innerParsedResult.SFMIdlItem;
                                    inner_ixs.push({
                                        ...innerDecodedData,
                                        idl_name: innerSFMIdlItem?.idl.name,
                                        idl_program_id: innerSFMIdlItem?.programId,
                                        accounts: inner_ix?.accounts.map(
                                            (accountIndex: number) => accountKeys[accountIndex]
                                        ),
                                        data: innerDecodedData?.data,
                                        name: innerDecodedData?.name,
                                        innerSFMIdlItem,
                                    });
                                    programs = {
                                        ...programs,
                                        [innerSFMIdlItem?.programId as string]: innerSFMIdlItem?.idl.name as string,
                                    };
                                }
                            }
                        }
                        decodedData = {
                            ...decodedData,
                            inner: inner_ixs,
                        } as any;
                    }
                    ixs.push(decodedData);
                    ixIndex++;
                }
                setIxs(ixs);
                setPrograms(programs);
            } catch (error) {
                console.error("Failed to parse transaction:", error);
            }
        };

        fetchDecodedData();
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
            <Flex align="baseline" gap="md">
                <Text size="xl" fw={700} mb="md">
                    Transaction Details
                </Text>
            </Flex>
            <Grid className="dashboard-cards">
                {transaction && (
                    <>
                        <TxInfo signature={signature} transaction={transaction} />
                        <TxInstructions ixs={ixs} />
                        <TxLogs logs={transaction.meta.logMessages} programs={programs}/>
                    </>
                )}
            </Grid>
        </Flex>
    );
};

export default Tx;
