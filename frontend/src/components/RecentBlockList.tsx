import { Button, Flex, Table, Text } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

interface Block {
    blockHeight: string;
    blockTime: string;
    blockhash: string;
    slot: number;
}

const RecentBlockList = () => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSlot, setLastSlot] = useState<number | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: string } | null>(null);

    const fetchBlocks = async (endSlot: number | null) => {
        setLoading(true);
        try {
            const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/blocks?end=${endSlot}`);
            const newBlocks = response.data;
            setBlocks((prevBlocks) => {
                const combinedBlocks = [...prevBlocks, ...newBlocks];
                const uniqueBlocks = Array.from(new Set(combinedBlocks.map((block) => block.slot))).map((slot) =>
                    combinedBlocks.find((block) => block.slot === slot)
                );
                uniqueBlocks.sort((a, b) => b.slot - a.slot);
                return uniqueBlocks;
            });
            if (newBlocks.length > 0) {
                setLastSlot(newBlocks[newBlocks.length - 1].slot);
            }
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        const fetchInitialBlocks = async () => {
            try {
                const slotData = await (async () => {
                    try {
                        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/slot`, {
                            headers: { "Content-Type": "application/json" },
                        });

                        return response.data.slot;
                    } catch (error: any) {
                        console.error(error);
                        throw new Error("Failed to fetch slot.");
                    }
                })();

                fetchBlocks(slotData);
            } catch (error) {
                console.error("Error fetching initial blocks:", error);
            }
        };

        fetchInitialBlocks();
    }, []);

    let sortedBlocks = [...blocks];
    if (sortConfig !== null) {
        sortedBlocks.sort((a, b) => {
            const key = sortConfig.key as keyof Block;
            if (a[key] < b[key]) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a[key] > b[key]) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            // If slots are the same, sort by slot
            if (a.slot < b.slot) {
                return sortConfig.direction === "ascending" ? -1 : 1;
            }
            if (a.slot > b.slot) {
                return sortConfig.direction === "ascending" ? 1 : -1;
            }
            return 0;
        });
    }

    const requestSort = (key: string) => {
        let direction = "ascending";
        if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending";
        }
        setSortConfig({ key, direction });
    };

    return (
        <Flex w="100%" direction="column" gap="md">
            <Flex align="baseline" gap="md">
                <Text size="xl" fw={700} mb="md">
                    Recent Blocks
                </Text>
            </Flex>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th onClick={() => requestSort("slot")}>Slot</Table.Th>
                        <Table.Th onClick={() => requestSort("blockHeight")}>Block Height</Table.Th>
                        <Table.Th onClick={() => requestSort("blockTime")}>Block Time</Table.Th>
                        <Table.Th onClick={() => requestSort("blockhash")}>Block Hash</Table.Th>
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
            <Button onClick={() => fetchBlocks(lastSlot ? lastSlot - 1 : null)} disabled={loading} loading={loading}>
                Load More
            </Button>
        </Flex>
    );
};

export default RecentBlockList;
