import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { LOCAL_DECK_MATERIALS } from "@/config/constants/ui";
import { useRender } from "@/hooks/useRender";
import { useCatanStore } from "@/store/useCatanStore";
import { useEffect } from "react";

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
        ui: { events },
    } = useCatanStore();

    const render = useRender();

    useEffect(() => {
        events.on("render decks", render);
        return () => {
            events.off("render decks", render);
        };
    }, [render]);

    const combine = [...materials, ...devcards];

    return (
        <div>
            <div className="relative flex scale-90 gap-2 px-7 pb-1 pt-3 items-center justify-around">
                {combine.map((value, index) => {
                    const setting = isReactIcons[index]
                        ? {
                              color: "white",
                              opacity: 0.2,
                              size: 25,
                          }
                        : {
                              stroke: "white",
                              opacity: 0.2,
                              fill: "white",
                              width: 30,
                              height: 30,
                          };
                    const rightIcon = LOCAL_DECK_MATERIALS[index].icon(setting);

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <div className="flex flex-row-reverse  items-center opacity-65">
                                    <p className="text-2xl w-5 -translate-x-4 translate-y-2 font-[Rubik] font-medium scale-70">
                                        {value}
                                    </p>
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
