import { Card, Flex, Grid, Text } from "@mantine/core";

const Log = ({ log }: { log: any }) => {
    const { log: logMessage, level, type } = log;
    return (
        <Flex ml={(level - 1) * 28}>
            <Text size="xs" fw={type === "invoke" ? "bold" : "normal"}>
                {logMessage}
            </Text>
        </Flex>
    );
};

const processLogs = (logs: any[], programs: any) => {
    if (logs.length === 0) return [];

    const processedLogs: any[] = [];
    let currentLevel = 1;
    let programCount = 1;

    logs.forEach((log) => {
        let logMessage = log;
        const levelMatch = logMessage.match(/\[(\d+)\]$/);
        const programId = logMessage.split("Program ")[1]?.split(" ")[0];
        const programName = programs[programId];
        let type = "log";

        if (levelMatch) {
            currentLevel = parseInt(levelMatch[1], 10);
        }

        if (logMessage.includes("invoke")) {
            logMessage = `Invoking ${programName} Program`;
            logMessage = currentLevel === 1 ? `#${programCount} ${logMessage}` : `> ${logMessage}`;
            type = "invoke";
            if (currentLevel === 1) programCount++;
        } else {
            if (programName) {
                logMessage = logMessage.replace(programId, programName);
            }
            logMessage = `> ${logMessage}`;
        }

        processedLogs.push({ log: logMessage, level: currentLevel, type });

        if (/success$/.test(logMessage) || /fail$/.test(logMessage)) {
            currentLevel = Math.max(1, currentLevel - 1);
        }
    });

    return processedLogs;
};

const TxLogs = ({ logs, programs }: { logs: any[]; programs: any }) => {
    const processedLogs = processLogs(logs, programs);

    return (
        <Grid.Col span={12}>
            <Card shadow="sm" py="md" radius="md" withBorder>
                <Flex direction="column" gap="sm">
                    <Text size="sm">Logs:</Text>
                    <Card
                        bg="gray.0"
                        p="md"
                        radius="md"
                        withBorder
                        style={{ overflow: "auto", fontFamily: "monospace" }}
                    >
                        <Flex direction="column" gap="sm">
                            {processedLogs.length > 0 &&
                                processedLogs.map((log: any, idx: number) => <Log log={log} key={idx} />)}
                        </Flex>
                    </Card>
                </Flex>
            </Card>
        </Grid.Col>
    );
};

export default TxLogs;
