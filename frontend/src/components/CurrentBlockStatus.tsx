import { useBlock } from "@/hooks/useBlock";
import { Card, ColorSwatch, Flex, Grid, Text } from "@mantine/core";

const CurrentBlockStatus = ({ slot }: { slot: number | null }) => {
    const { block, loading: blockLoading, error: blockError } = useBlock(slot);
    return (
        <Flex w="100%" direction="column" gap="md" mb="xl">
            <Flex align="baseline" gap="md">
                <Text size="xl" fw={700} mb="md">
                    Current Block Status
                </Text>
                {blockLoading ? (
                    <ColorSwatch color="yellow" size={14} />
                ) : blockError ? (
                    <ColorSwatch color="red" size={14} />
                ) : (
                    <ColorSwatch color="green" size={14} />
                )}
            </Flex>
            <Grid className="dashboard-cards">
                {block && (
                    <>
                        <Grid.Col span={12}>
                            <Card shadow="sm" p="md" radius="md" withBorder>
                                <Text size="sm">Slot: {block.slot}</Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Card shadow="sm" p="md" radius="md" withBorder>
                                <Text size="sm">Block Height: {block.blockHeight}</Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Card shadow="sm" p="md" radius="md" withBorder>
                                <Text size="sm">Block Hash: {block.blockhash}</Text>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={12}>
                            <Card shadow="sm" p="md" radius="md" withBorder>
                                <Text size="sm">Parent Slot: {block.parentSlot}</Text>
                            </Card>
                        </Grid.Col>
                    </>
                )}
                {blockLoading &&
                    !block &&
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
                        ))}
            </Grid>
        </Flex>
    );
};

export default CurrentBlockStatus;
