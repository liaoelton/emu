export type SortConfig<T> = {
    key: keyof T;
    direction: "ascending" | "descending";
};

export const sortData = <T extends { slot?: number }>(data: T[], sortConfig: SortConfig<T> | null): T[] => {
    if (sortConfig === null) return data;
    return [...data].sort((a, b) => {
        const aValue = a[sortConfig.key] ?? 0;
        const bValue = b[sortConfig.key] ?? 0;
        if (aValue < bValue) {
            return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
            return sortConfig.direction === "ascending" ? 1 : -1;
        }
        if (sortConfig.key !== "slot") {
            return sortConfig.direction === "ascending" ? -1 : 1;
        }
        return 0;
    });
};

export const createSortHandler =
    <T>(setSortConfig: React.Dispatch<React.SetStateAction<SortConfig<T> | null>>) =>
    (key: keyof T) => {
        setSortConfig((prevSortConfig) => {
            if (prevSortConfig && prevSortConfig.key === key && prevSortConfig.direction === "ascending") {
                return { key, direction: "descending" };
            }
            return { key, direction: "ascending" };
        });
    };
