import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLORS, DEVELOPMENTS, ONLINE_STATS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { Player } from "@/types/player";

// import { IoLogoGameControllerB } from "react-icons/io";
import { PiHouseSimpleFill } from "react-icons/pi";

import { TbRectangleVerticalFilled } from "react-icons/tb";

const cardsColor = "#111";

export function RoadCard() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative  w-[30px] h-[30px] opacity-80 hover:opacity-100 transition-opacity">
                    {ONLINE_STATS[3].icon({
                        size: 15,
                        color: cardsColor,
                        className: "absolute top-0 z-20 translate-[7.5px]",
                    })}
                    <TbRectangleVerticalFilled
                        size={30}
                        opacity={1}
                        className="absolute top-0 z-10"
                    />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Longest Road Card</p>
            </TooltipContent>
        </Tooltip>
    );
}

export function KnightCard() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative  w-[30px] h-[30px] opacity-80 hover:opacity-100 transition-opacity">
                    {DEVELOPMENTS[0].icon({
                        size: 15,
                        color: cardsColor,
                        className: "absolute top-0 z-20 translate-[7.5px]",
                    })}
                    <TbRectangleVerticalFilled
                        size={30}
                        className="absolute top-0 z-10"
                    />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Largest Army Card</p>
            </TooltipContent>
        </Tooltip>
    );
}

export function OnlinePlayerCard({
    player,
    largestArmy,
    longestRoad,
    turnId,
}: {
    player: Player;
    largestArmy: number;
    longestRoad: number;
    turnId: number;
}) {
    const {
        materials,
        devcards,
        name,
        victoryPoints,
        color,
        maxRoad,
        knightUsed,
    } = player;

    console.log("client", "victoryPoints", victoryPoints);
    console.log("client", "OnlinePlayerCard", "maxRoad", maxRoad);

    const belongLargestArmy = largestArmy === color;
    const belongLongestRoad = longestRoad === color;

    const list = [victoryPoints, materials + devcards, knightUsed, maxRoad];

    const elements = list.flatMap((value, index) => [
        <Tooltip key={index}>
            <TooltipTrigger asChild>
                <div className="flex gap-2 items-center opacity-65">
                    <p className="text-lg font-[Rubik] scale-90">{value}</p>
                    {ONLINE_STATS[index].icon({
                        color: ONLINE_STATS[index].color ?? "white",
                        opacity: 0.65,
                        style: ONLINE_STATS[index].shadow
                            ? {
                                  filter: ONLINE_STATS[index].shadow,
                              }
                            : {},
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
        <div className="flex gap-2 px-4 py-1 items-center relative">
            <div className="absolute flex gap-0 pr-3 right-full">
                {belongLongestRoad ? <RoadCard /> : null}
                {belongLargestArmy ? <KnightCard /> : null}
            </div>
            <PiHouseSimpleFill
                opacity={1}
                style={{
                    filter: `drop-shadow(0px 0px 10px ${COLORS[color]}, drop-shadow(0px 0px 10px ${COLORS[color]}`,
                    animationDelay: `${color / 2}s`,
                    scale: "0.7",
                }}
                className={cn(
                    "animate-pulse transition-[rotate]",
                    turnId === player.color ? "rotate-180" : "rotate-90"
                )}
                color={COLORS[color]}
            />
            <h2 className="flex-1 mr-12 text-[20px]">{name}</h2>
            {elements}
        </div>
    );
}
