import NavBar from "@/components/Navbar";
import "@/styles/globals.css";
import { AppShell, Group, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

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
                    <main className={`flex min-h-screen flex-col items-center px-24 ${inter.className}`}>
                        <Component {...pageProps} />
                    </main>
                </AppShell.Main>
            </AppShell>
        </MantineProvider>
    );
}
