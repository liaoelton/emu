import { Button, Flex, Group, TextInput } from "@mantine/core";
import { useState } from "react";

const NavBar = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const handleSearch = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/search/${searchQuery}`);
            if (!response.ok) {
                throw new Error("Failed to fetch search results");
            }
            const data = await response.json();
            if (data.type === "block") {
                window.location.href = `/block/${searchQuery}`;
            } else if (data.type === "transaction") {
                window.location.href = `/tx/${searchQuery}`;
            } else if (data.type === "address") {
                console.error("Address not implemented yet");
            } else {
                console.error("Unknown data type returned from search");
            }
        } catch (error) {
            console.error("Error during search:", error);
        }
    };

    return (
        <Flex mih={60} w="100vw" p="xs" align="center" justify="space-between">
            <div>EmuScan</div>
            <Group>
                <TextInput
                    placeholder="Search tx or block..."
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                />
                <Button onClick={handleSearch}>Go</Button>
            </Group>
        </Flex>
    );
};

export default NavBar;
