import NavBar from "@/components/Navbar";
import "@/styles/globals.css";
import { AppShell, Group, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
    return (
        <MantineProvider>
            <AppShell header={{ height: 60 }} padding="md">
                <AppShell.Header>
                    <Group h="100%" px="md">
                        <NavBar />
                    </Group>
                </AppShell.Header>
                <AppShell.Main>
                    <Component {...pageProps} />
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
}
