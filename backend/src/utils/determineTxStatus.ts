export const determineTxStatus = (meta: any | null): "success" | "failed" => {
    try {
        if ("Err" in meta?.status) {
            return "failed";
        } else if ("Ok" in meta?.status) {
            return "success";
        }
        return "failed";
    } catch (error) {
        console.error("Error determining transaction status:", error);
        return "failed";
    }
};
