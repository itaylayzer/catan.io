import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MATERIALS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { type MaterialList } from "@/types/materials";

export function MatsCountsViewer({ mats }: { mats: MaterialList }) {
    return (
        <>
            {mats.map((value, index) => (
                <Tooltip key={index}>
                    <TooltipTrigger asChild>
                        <div
                            className={cn(
                                "flex gap-1 items-center",
                                value ? "opacity-100" : "opacity-30"
                            )}
                        >
                            <p className="text-lg scale-90 font-[Rubik]">
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
                </Tooltip>
            ))}
        </>
    );
}
