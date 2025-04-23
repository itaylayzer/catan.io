import { useCatanStore } from "@/store/useCatanStore";
import { OnlinePlayerCard } from "./OnlinePlayerCard";
import { ReactNode, useEffect } from "react";
import { useRender } from "@/hooks/useRender";

export default function PlayersBar() {
    const {
        onlines,
        local,
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
        list.push(OnlinePlayerCard({ player: player }))
    );
    list.push(
        OnlinePlayerCard({
            player: {
                color: 0,
                devcards: local.devcards.reduce((a, b) => a + b),
                materials: local.materials.reduce((a, b) => a + b),
                name: local.name,
                roads: local.roads,
                victoryPoints: local.victoryPoints,
            },
        })
    );
    list.push(<hr />);
    list.push(
        OnlinePlayerCard({
            player: {
                color: 1,
                devcards: local.devcards.reduce((a, b) => a + b),
                materials: local.materials.reduce((a, b) => a + b),
                name: local.name,
                roads: local.roads,
                victoryPoints: local.victoryPoints,
            },
        })
    );
    list.push(<hr />);
    list.push(
        OnlinePlayerCard({
            player: {
                color: 2,
                devcards: local.devcards.reduce((a, b) => a + b),
                materials: local.materials.reduce((a, b) => a + b),
                name: local.name,
                roads: local.roads,
                victoryPoints: local.victoryPoints,
            },
        })
    );
    list.push(<hr />);
    list.push(
        OnlinePlayerCard({
            player: {
                color: 3,
                devcards: local.devcards.reduce((a, b) => a + b),
                materials: local.materials.reduce((a, b) => a + b),
                name: local.name,
                roads: local.roads,
                victoryPoints: local.victoryPoints,
            },
        })
    );

    return (
        <div className="outline-1 rounded-sm flex flex-col gap-1 p-2">
            {list}
        </div>
    );
}
