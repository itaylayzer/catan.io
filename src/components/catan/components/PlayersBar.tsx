import { useRender } from "@/hooks/useRender";
import { useCatanStore } from "@/store/useCatanStore";
import VMath from "@/utils/VMath";
import { ReactNode, useEffect } from "react";
import { OnlinePlayerCard } from "./OnlinePlayerCard";

export default function PlayersBar() {
    const {
        onlines,
        local,
        largestArmy,
        longestRoad,
        ui: { events },
    } = useCatanStore();

    const render = useRender();

    useEffect(() => {
        events.on("render decks", render);
        return () => {
            events.off("render decks", render);
        };
    }, [render]);

    const list: ReactNode[] = [];
    onlines.forEach((player) =>
        list.push(
            OnlinePlayerCard({ player, largestArmy, longestRoad }),
            <hr />
        )
    );
    list.push(
        OnlinePlayerCard({
            player: {
                color: local.color,
                devcards: VMath(local.devcards).sum(),
                materials: VMath(local.materials).sum(),
                name: local.name,
                roads: local.roads,
                victoryPoints: local.victoryPoints,
                cities: [],
                settlements: [],
                maxRoad: local.maxRoad,
                knightUsed: local.knightUsed,
                ready: local!.ready,
            },
            largestArmy,
            longestRoad,
        })
    );

    return (
        <div className="outline-1 rounded-sm flex flex-col gap-1 p-2">
            {list}
        </div>
    );
}
