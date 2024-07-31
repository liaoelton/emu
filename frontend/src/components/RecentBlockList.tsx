import { Block } from "@/types/Block";
import { createSortHandler, SortConfig, sortData } from "@/utils/sorting";
import { Button, Flex, Table, Text } from "@mantine/core";
import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";

const RecentBlockList = ({ startSlot, renewStartSlot }: { startSlot: number | null; renewStartSlot: () => void }) => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSlot, setLastSlot] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig<Block> | null>(null);
    const [slot, setSlot] = useState<number | null>(null);

    const fetchBlocks = useCallback(async (endSlot: number | null) => {
        setLoading(true);
        if (endSlot === null) return;
        try {
            setError(null);
            if (slot && endSlot > slot) return;
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/blocks?end=${endSlot}`);
            const newBlocks: Block[] = response.data;
            setBlocks((prevBlocks) => {
                const combinedBlocks = [...prevBlocks, ...newBlocks];
                const uniqueBlocks = Array.from(new Set(combinedBlocks.map((block) => block.slot))).map((slot) =>
                    combinedBlocks.find((block) => block.slot === slot)
                ) as Block[];
                uniqueBlocks.sort((a, b) => b.slot - a.slot);
                return uniqueBlocks;
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (blocks.length > 0) {
            const minSlot = Math.min(...blocks.map((block) => block.slot));
            setLastSlot(minSlot - 1);
        }
    }, [blocks]);

    useEffect(() => {
        if (startSlot) fetchBlocks(startSlot);
    }, [startSlot]);

    const sortedBlocks = useMemo(() => sortData(blocks, sortConfig), [blocks, sortConfig]);
    const requestSort = createSortHandler(setSortConfig);

    return (
        <Flex w="100%" direction="column" gap="md">
            <Flex align="baseline" gap="md">
                <Text size="xl" fw={700} mb="md">
                    Recent Blocks of Slot {startSlot}
                </Text>
                <Button
                    onClick={() => {
                        setBlocks([]);
                        renewStartSlot();
                    }}
                >
                    Refresh
                </Button>
            </Flex>
            <Table styles={{td:{minWidth:"160px"}}}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th onClick={() => requestSort("slot")}>
                            Slot {sortConfig?.key === "slot" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("blockHeight")}>
                            Block Height{" "}
                            {sortConfig?.key === "blockHeight" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("blockTime")}>
                            Block Time{" "}
                            {sortConfig?.key === "blockTime" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                        <Table.Th onClick={() => requestSort("blockhash")}>
                            Block Hash{" "}
                            {sortConfig?.key === "blockhash" && (sortConfig.direction === "ascending" ? "↑" : "↓")}
                        </Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {sortedBlocks.map((block) => (
                        <Table.Tr key={block.slot}>
                            <Table.Td>{block.slot}</Table.Td>
                            <Table.Td>{block.blockHeight}</Table.Td>
                            <Table.Td>{block.blockTime}</Table.Td>
                            <Table.Td>{block.blockhash}</Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>
            <Button onClick={() => fetchBlocks(lastSlot)} disabled={loading} loading={loading}>
                Load More
            </Button>
            {error && <Text>{error}</Text>}
        </Flex>
    );
};

export default RecentBlockList;
