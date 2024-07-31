import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <title>EmuScan</title>
                <link rel="icon" href="/emu.png" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
