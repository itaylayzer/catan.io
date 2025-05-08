import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { COLORS, ONLINE_STATS } from "@/config/constants/ui";
import { Player } from "@/types/player";

// import { IoLogoGameControllerB } from "react-icons/io";
import { PiHouseSimpleFill } from "react-icons/pi";

export function OnlinePlayerCard({ player }: { player: Player }) {
    const { materials, devcards, name, victoryPoints, color, roads } = player;

    console.log("client", "victoryPoints", victoryPoints);
    const list = [victoryPoints, materials, devcards, roads.length];

    const elements = list.flatMap((value, index) => [
        <Tooltip key={index}>
            <TooltipTrigger asChild>
                <div className="flex gap-2 items-center opacity-65">
                    <p className="text-lg font-[Rubik] scale-90">{value}</p>
                    {ONLINE_STATS[index].icon({
                        color: "white",
                        opacity: 0.65,
                    })}
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>{ONLINE_STATS[index].name}</p>
            </TooltipContent>
        </Tooltip>,
        <div className="h-2 outline-1" />,
    ]);

    elements.pop();

    return (
        <div className="flex gap-2 px-4 py-1 items-center">
            <PiHouseSimpleFill
                opacity={1}
                style={{
                    filter: `drop-shadow(0px 0px 10px ${COLORS[color]}, drop-shadow(0px 0px 10px ${COLORS[color]}`,
                    animationDelay: `${color / 2}s`,
                    rotate: "90deg",
                    scale: "0.7",
                }}
                className="animate-pulse"
                color={COLORS[color]}
            />
            <h2 className="flex-1 mr-12 text-[20px]">{name}</h2>
            {elements}
        </div>
    );
}
