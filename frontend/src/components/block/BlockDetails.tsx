import { Block } from "@/types/Block";
import { Card, Flex, Grid, Text } from "@mantine/core";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { BlockTxLink } from "../BlockTxLink";

const BlockDetails = () => {
    const router = useRouter();
    const { slot } = router.query;
    const [block, setBlock] = useState<Block | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (slot) {
            const fetchBlockDetails = async () => {
                try {
                    const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/blocks/${slot}`, {
                        headers: { "Content-Type": "application/json" },
                    });
                    const data: Block = response.data;
                    setBlock(data);
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
    }, [slot]);

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
                    Block Details
                </Text>
            </Flex>
            {block ? (
                <Grid className="dashboard-cards">
                    <Grid.Col span={12}>
                        <Card shadow="sm" p="md" radius="md" withBorder>
                            <Text size="sm">
                                Slot: <BlockTxLink type="block">{block.slot}</BlockTxLink>
                            </Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Card shadow="sm" p="md" radius="md" withBorder>
                            <Text size="sm">Block Height: {block.blockHeight}</Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Card shadow="sm" p="md" radius="md" withBorder>
                            <Text size="sm">Block Time: {block.blockTime}</Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Card shadow="sm" p="md" radius="md" withBorder>
                            <Text size="sm">Block Hash: {block.blockhash}</Text>
                        </Card>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Card shadow="sm" p="md" radius="md" withBorder>
                            <Text size="sm">
                                Parent Slot: <BlockTxLink type="block">{block.parentSlot}</BlockTxLink>
                            </Text>
                        </Card>
                    </Grid.Col>
                    {block.tx_sigs && (
                        <Grid.Col span={12}>
                            <Card shadow="sm" p="md" radius="md" withBorder>
                                <Text size="sm">Transaction Number: {block.tx_sigs.length}</Text>
                            </Card>
                        </Grid.Col>
                    )}
                </Grid>
            ) : (
                Array(4)
                    .fill(0)
                    .map((_, i) => (
                        <Grid.Col span={12} key={i}>
                            <Card
                                h={54.3}
                                shadow="sm"
                                p="md"
                                radius="md"
                                withBorder
                                className="animate-pulse bg-gray-400  p-4 rounded-md shadow-md"
                            />
                        </Grid.Col>
                    ))
            )}
        </Flex>
    );
};

export default BlockDetails;
