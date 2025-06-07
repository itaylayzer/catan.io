import { TradeItem } from "@/components/catan/trades/TradeItem";

export default function () {
    return (
        <>
            <TradeItem
                onCancel={() => {}}
                trade={{
                    from: 0,
                    id: 2,
                    mats: [-1, 2, 3, 0, 0],
                    to: new Set([1, 2]),
                }}
            />

            <TradeItem
                onCancel={() => {}}
                trade={{
                    from: 2,
                    id: 2,
                    mats: [-1, 2, 3, 0, 0],
                    to: new Set([0, 2]),
                }}
            />
        </>
    );
}
