import { useCatanStore } from "@/store/useCatanStore";
import { TradeItem } from "./TradeItem";

export function TradesArea() {
    const { trades: tradesMap, set } = useCatanStore();

    const trades = Array.from(tradesMap.entries()).sort(
        ([firstKey], [secondKey]) => secondKey - firstKey
    );

    const cancel = (id: number) => () => {
        tradesMap.delete(id);

        set({ trades: new Map(tradesMap) });
    };

    return (
        <div className="flex justify-end pb-7 flex-1 flex-col gap-4">
            {trades.map(([key, trade]) => {
                return <TradeItem onCancel={cancel(key)} trade={trade} />;
            })}
        </div>
    );
}
