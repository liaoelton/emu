import CurrentBlockStatus from "@/components/CurrentBlockStatus";
import RecentBlockList from "@/components/RecentBlockList";
import { useSlot } from "@/hooks/useSlot";
import { useState } from "react";

export default function Home() {
    const { slot: currentSlot, loading, error } = useSlot();
    const [recentSlot, setRecentSlot] = useState<number | null>(null);
    const updateRecentSlot = () => {
        setRecentSlot(currentSlot);
    };
    if (!recentSlot && currentSlot) {
        setRecentSlot(currentSlot);
    }
    return (
        <>
            <CurrentBlockStatus slot={currentSlot} />
            <RecentBlockList startSlot={recentSlot} renewStartSlot={updateRecentSlot} />
        </>
    );
}
