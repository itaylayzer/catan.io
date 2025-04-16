import { useCatanStore } from "@/store/useCatanStore";
import { OnlinePlayerCard } from "./OnlinePlayerCard";
import { ReactNode } from "react";

export default function PlayersBar() {
    const { onlines, local } = useCatanStore();

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
