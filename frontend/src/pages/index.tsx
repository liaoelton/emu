import CurrentBlockStatus from "@/components/CurrentBlockStatus";
import RecentBlockList from "@/components/RecentBlockList";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
    return (
        <main className={`flex min-h-screen flex-col items-center px-24 ${inter.className}`}>
            <CurrentBlockStatus />
            <RecentBlockList />
        </main>
    );
}
