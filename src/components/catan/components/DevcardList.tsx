import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEVELOPMENTS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { type DevcardList } from "@/types/materials";

export function DevcardssCountsViewer({
    devs,
    colorize = true,
    shadowed = false,
}: {
    devs: DevcardList;
    colorize?: boolean;
    shadowed?: boolean;
}) {
    return (
        <>
            {devs.map((value, index) => {
                const { color, name, icon } = DEVELOPMENTS[index];

                const fixedColor = colorize ? color : "#ffffff";

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
                                {icon({
                                    stroke: fixedColor,
                                    opacity: 0.65,
                                    fill: fixedColor,
                                    width: 20,
                                    height: 20,
                                    style: shadowed
                                        ? {
                                              filter: `drop-shadow(0px 0px 2px ${fixedColor}) drop-shadow(0px 0px 50px ${fixedColor}) drop-shadow(0px 0px 50px ${fixedColor})`,
                                          }
                                        : {},
                                })}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{name}</p>
                        </TooltipContent>
                    </Tooltip>
                );
            })}
        </>
    );
}
