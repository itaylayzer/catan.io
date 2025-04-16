import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { LOCAL_DECK_MATERIALS } from "@/config/constants/ui";
import { useCatanStore } from "@/store/useCatanStore";

const isReactIcons = [
    false,
    false,
    false,
    false,
    false,
    true,
    true,
    true,
    true,
    false,
];

export function LocalPlayerDeck({}: {}) {
    const {
        local: { materials, devcards },
    } = useCatanStore();
    const combine = [...materials, ...devcards];

    return (
        <div>
            <div className="relative flex rounded-lg border-1 scale-90 gap-5 px-7 py-3 items-center justify-around">
                {combine.map((value, index) => {
                    const setting = isReactIcons[index]
                        ? {
                              color: "white",
                              opacity: 0.65,
                              size: 25,
                          }
                        : {
                              stroke: "white",
                              opacity: 0.65,
                              fill: "white",
                              width: 30,
                              height: 30,
                          };
                    const rightIcon = LOCAL_DECK_MATERIALS[index].icon(setting);

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <div className="flex gap-2 items-center opacity-65">
                                    <p className="text-2xl">{value}</p>
                                    {rightIcon}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{LOCAL_DECK_MATERIALS[index].name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
