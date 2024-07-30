import { Card, Flex, Grid, Text } from "@mantine/core";
import dynamic from "next/dynamic";
const DynamicReactJson = dynamic(import("react-json-view"), { ssr: false });

const IxKeyText = (props: any) => (
    <Text size="sm" miw={160} {...props}>
        {props.children}
    </Text>
);

const IxJsonDetail = ({ ixKey, data }: { ixKey: string; data: any }) => {
    return (
        <Flex>
            <IxKeyText>{ixKey}</IxKeyText>
            <Card bg="white" p="xs" radius="md" withBorder className="flex-1">
                <DynamicReactJson
                    src={data}
                    displayDataTypes={false}
                    enableClipboard={false}
                    name={false}
                    style={{ fontSize: "12px" }}
                />
            </Card>
        </Flex>
    );
};

const IxDetails = ({ ix }: { ix: any }) => {
    return (
        <>
            <Flex>
                <IxKeyText>Interact with:</IxKeyText>
                <Text size="sm">
                    {ix.idl_name} ({ix.idl_program_id})
                </Text>
            </Flex>
            {ix.accounts && ix.accounts.length > 0 && <IxJsonDetail ixKey="Input accounts" data={ix.accounts} />}
            {ix.data && <IxJsonDetail ixKey="Data" data={ix.data} />}
        </>
    );
};

const InstructionDetails = ({ ix, idx }: { ix: any; idx: number }) => {
    return (
        <>
            <Text size="sm" fw="bold">
                #{ix.index} {ix.idl_name}: {ix.name}
            </Text>
            <Card bg="gray.0" p="md" radius="md" withBorder>
                <Flex direction="column" gap="md">
                    <IxDetails ix={ix} />
                    {ix.inner && ix.inner.length > 0 && (
                        <Flex>
                            <IxKeyText>Inner instructions:</IxKeyText>
                            <Flex direction="column" gap="sm" className="flex-1">
                                {ix.inner?.map((inner: any, i: number) => (
                                    <Card bg="white" p="sm" radius="md" withBorder>
                                        <Flex direction="column" gap="md">
                                            <Text size="sm" fw="bold">
                                                #{idx}.{i} {inner.idl_name}: {inner.name}
                                            </Text>
                                            <IxDetails ix={inner} />
                                        </Flex>
                                    </Card>
                                ))}
                            </Flex>
                        </Flex>
                    )}
                </Flex>
            </Card>
        </>
    );
};

const TxInstructions = (props: any) => {
    const { ixs } = props;

    return (
        <Grid.Col span={12}>
            <Card shadow="sm" py="md" radius="md" withBorder>
                <Flex direction="column" gap="sm">
                    <Text size="sm">Instructions:</Text>
                    {ixs.length > 0 && ixs.map((ix: any, idx: number) => <InstructionDetails ix={ix} idx={idx} />)}
                </Flex>
            </Card>
        </Grid.Col>
    );
};

export default TxInstructions;
