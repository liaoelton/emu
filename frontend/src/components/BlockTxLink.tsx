import { Anchor } from "@mantine/core";

export const BlockTxLink = ({ type, children }: { type: string; children: React.ReactNode }) => {
    let href;
    if (type === "block") {
        href = `/block/${children}`;
    } else if (type === "tx") {
        href = `/tx/${children}`;
    }
    return (
        <Anchor href={href} rel="noreferrer">
            {typeof children === "string" && children.length > 10
                ? `${children.slice(0, 5)}...${children.slice(-5)}`
                : children}
        </Anchor>
    );
};
