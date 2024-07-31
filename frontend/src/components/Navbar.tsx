import { Avatar, Button, Flex, Group, TextInput, Title } from "@mantine/core";
import { useWindowEvent } from "@mantine/hooks";
import { useState } from "react";

const NavBar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/search/${searchQuery}`);
            if (!response.ok) {
                throw new Error("Failed to fetch search results");
            }
            const data = await response.json();
            if (data.type === "block") {
                const slot = data.data.slot;
                window.location.href = `/block/${slot}`;
            } else if (data.type === "transaction") {
                window.location.href = `/tx/${searchQuery}`;
            } else if (data.type === "address") {
                console.error("Address not implemented yet");
            } else {
                console.error("Unknown data type returned from search");
            }
            setLoading(false);
        } catch (error: any) {
            setLoading(false);
            setError(error.message);
            window.alert("Please enter a valid slot number, signature, or indexed blockHash.");
            setSearchQuery("");
            console.error("Error during search:", error);
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        if (event.key === "Enter" && searchQuery.trim() !== "") {
            handleSearch();
        }
    };

    useWindowEvent("keydown", handleKeyPress);

    return (
        <Flex mih={60} w="100vw" p="xs" align="center" justify="space-between">
            <Flex align="center" gap="xs" component="a" href="/">
                <Avatar src="/emu.png" />
                <Title order={2}>EmuScan</Title>
            </Flex>
            <Group>
                <TextInput
                    placeholder="Search tx or block..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                />
                <Button onClick={handleSearch} loading={loading}>
                    Go
                </Button>
            </Group>
        </Flex>
    );
};

export default NavBar;
