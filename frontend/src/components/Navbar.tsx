import { Button, Flex, Group, TextInput } from "@mantine/core";
import { useState } from "react";

const NavBar = () => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <Flex mih={60} w="100vw" p="xs" align="center" justify="space-between">
            <div>EmuScan</div>
            <Group>
                <TextInput
                    placeholder="Search tx or block..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                />
            </Group>
        </Flex>
    );
};

export default NavBar;
