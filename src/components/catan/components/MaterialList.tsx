import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MATERIALS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { type MaterialList } from "@/types/materials";
import { convertions } from "../map/configs";

export function MatsCountsViewer({
    mats,
    colorize = true,
    shadowed = false,
}: {
    mats: MaterialList;
    colorize?: boolean;
    shadowed?: boolean;
}) {
    return (
        <>
            {mats.map((value, index) => {
                const color = colorize
                    ? convertions.matsColors[
                          MATERIALS[index].name.toLowerCase()
                      ]
                    : "#ffffff";

                return (
                    <Tooltip key={index}>
                        <TooltipTrigger asChild>
                            <div
                                className={cn(
                                    "flex gap-2 items-center",
                                    value ? "" : "hidden"
                                )}
                            >
                                <p className="text-lg scale-90 font-[Rubik]">
                                    {value}
                                </p>
                                {MATERIALS[index].icon({
                                    stroke: color,
                                    opacity: 0.65,
                                    fill: color,
                                    width: 20,
                                    height: 20,
                                    style: shadowed
                                        ? {
                                              filter: `drop-shadow(0px 0px 2px ${color}) drop-shadow(0px 0px 50px ${color}) drop-shadow(0px 0px 50px ${color})`,
                                          }
                                        : {},
                                })}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{MATERIALS[index].name}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </>
    );
}
