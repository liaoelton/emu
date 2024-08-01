import { Card, Grid, Text } from "@mantine/core";

const TxInfo = (props: any) => {
    const { signature, transaction } = props;
    return (
        <>
            <Grid.Col span={12}>
                <Card shadow="sm" p="md" radius="md" withBorder>
                    <Text size="sm">Signature: {signature}</Text>
                </Card>
            </Grid.Col>
            <Grid.Col span={12}>
                <Card shadow="sm" p="md" radius="md" withBorder>
                    <Text size="sm">Status: {transaction.txStatus}</Text>
                </Card>
            </Grid.Col>
            <Grid.Col span={12}>
                <Card shadow="sm" p="md" radius="md" withBorder>
                    <Text size="sm">Slot: {transaction.slot}</Text>
                </Card>
            </Grid.Col>
            <Grid.Col span={12}>
                <Card shadow="sm" p="md" radius="md" withBorder>
                    <Text size="sm">Fee: {transaction.meta.fee / 10 ** 9}</Text>
                </Card>
            </Grid.Col>
            <Grid.Col span={12}>
                <Card shadow="sm" p="md" radius="md" withBorder>
                    <Text size="sm">Block Time: {transaction.blockTime}</Text>
                </Card>
            </Grid.Col>
        </>
    );
};

export default TxInfo;
