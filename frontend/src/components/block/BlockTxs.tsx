import { Transaction } from "@/types/Transaction";
import { createSortHandler, SortConfig, sortData } from "@/utils/sorting";
import { Button, Flex, LoadingOverlay, Table, Text } from "@mantine/core";
import axios from "axios";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { BlockTxLink } from "../BlockTxLink";

const BlockTxs = () => {
    const router = useRouter();
    const { slot } = router.query;
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(1);
    const [totalPages, setTotalPages] = useState<number>(1);
    const [sortConfig, setSortConfig] = useState<SortConfig<any> | null>({ key: "index", direction: "ascending" });

    const fetchTransactions = useCallback(async (slot: number | null, page: number) => {
        if (!slot) return;
        setLoading(true);
        try {
            setError(null);
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/txs?block=${slot}&page=${page}`
            );
            const { transactions: newTransactions, meta } = response.data;
            setTransactions(
                newTransactions.map((tx: Transaction, index: number) => ({
                    index: (page - 1) * 10 + index + 1,
                    sig: tx.transaction.signatures[0],
                    txStatus: tx.txStatus,
                    slot: tx.slot,
                    blockTime: tx.blockTime,
                    meta: tx.meta,
                }))
            );
            setTotalPages(meta.totalPages);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!slot) return;
        fetchTransactions(Number(slot), page);
    }, [slot, page, fetchTransactions]);

    const sortedTransactions = useMemo(() => sortData(transactions, sortConfig), [transactions, sortConfig]);
    const requestSort = createSortHandler(setSortConfig);

    return (
        <Flex w="100%" direction="column" gap="md">
            <Flex align="baseline" gap="md">
                <Text size="xl" fw={700} mb="md">
                    Transactions
                </Text>
            </Flex>
            <Table styles={{ td: { minWidth: "100px" } }}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th onClick={() => requestSort("index")}>
                            Index {sortConfig?.key === "index" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("txStatus")}>
                            Status{" "}
                            {sortConfig?.key === "txStatus" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("sig")}>
                            Signature {sortConfig?.key === "sig" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("blockTime")}>
                            Block Time{" "}
                            {sortConfig?.key === "blockTime" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("meta")}>
                            Fee {sortConfig?.key === "meta" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {loading ? (
                        <LoadingOverlay visible={true} />
                    ) : (
                        sortedTransactions.map((transaction) => (
                            <Table.Tr key={transaction.signature}>
                                <Table.Td>{transaction.index}</Table.Td>
                                <Table.Td>{transaction.txStatus}</Table.Td>
                                <Table.Td>
                                    <BlockTxLink type="tx">{transaction.sig}</BlockTxLink>
                                </Table.Td>
                                <Table.Td>{transaction.blockTime}</Table.Td>
                                <Table.Td>{transaction.meta.fee / 10 ** 9}</Table.Td>
                            </Table.Tr>
                        ))
                    )}
                </Table.Tbody>
            </Table>
            <Flex justify="space-between" align="center">
                <Button
                    onClick={() => setPage((prevPage) => Math.max(prevPage - 1, 1))}
                    disabled={page === 1 || loading}
                >
                    Previous
                </Button>
                <Text>
                    Page {page} of {totalPages}
                </Text>
                <Button
                    onClick={() => setPage((prevPage) => Math.min(prevPage + 1, totalPages))}
                    disabled={page === totalPages || loading}
                >
                    Next
                </Button>
            </Flex>
            {error && <Text>{error}</Text>}
        </Flex>
    );
};

export default BlockTxs;
