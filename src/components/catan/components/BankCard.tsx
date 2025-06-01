import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { BANK_STATS, MATERIALS, ONLINE_STATS } from "@/config/constants/ui";
import { useCatanStore } from "@/store/useCatanStore";
import { KnightCard, RoadCard } from "./OnlinePlayerCard";

export function BankCard({}: {}) {
    const {
        bank: { devcards, materials },
        largestArmy,
        longestRoad,
    } = useCatanStore();
    return (
        <div className="relative flex outline-1 rounded-sm gap-2 px-4 pb-1 pt-2 items-center justify-around">
            <div className="absolute flex gap-0 pr-1 right-full">
                {longestRoad < 0 ? <RoadCard /> : null}
                {largestArmy < 0 ? <KnightCard /> : null}
            </div>
            <div className="absolute -top-[50%] left-3 bg-sidebar translate-x-[-50] translate-y-[50%] text-[20px] px-5 font-medium">
                Bank
            </div>
            {materials.flatMap((value, index) => [
                <Tooltip key={index}>
                    <TooltipTrigger asChild>
                        <div className="flex gap-2 items-center opacity-65">
                            <p className="text-lg font-[Rubik] scale-90">
                                {value}
                            </p>
                            {MATERIALS[index].icon({
                                stroke: "white",
                                opacity: 0.65,
                                fill: "white",
                                width: 20,
                                height: 20,
                            })}
                        </div>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{MATERIALS[index].name}</p>
                    </TooltipContent>
                </Tooltip>,
                <div className="h-2 outline-1" />,
            ])}
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex gap-2 items-center opacity-65">
                        <p className="text-lg font-[Rubik] scale-90">
                            {devcards.reduce((a, b) => a + b)}
                        </p>
                        {BANK_STATS[1].icon({
                            stroke: "white",
                            opacity: 0.65,
                            fill: "white",
                            width: 20,
                            height: 20,
                        })}
                    </div>
                </TooltipTrigger>
                <TooltipContent>{BANK_STATS[1].name}</TooltipContent>
            </Tooltip>
        </div>
    );
}
