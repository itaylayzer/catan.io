import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { LOCAL_DECK_MATERIALS } from "@/config/constants/ui";
import { useRender } from "@/hooks/useRender";
import { useCatanStore } from "@/store/useCatanStore";
import { useEffect } from "react";
import { convertions } from "../map/configs";
import { cn } from "@/lib/utils";
import { ServerCodes } from "@/config/constants/codes";

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
        ui: { events, dicesState },
        set,
        client: { socket },
    } = useCatanStore();

    const render = useRender();

    useEffect(() => {
        events.on("render decks", render);
        return () => {
            events.off("render decks", render);
        };
    }, [render]);

    const combine = [...materials, ...devcards];

    const turnNotMine = dicesState !== "mine";

    const disabled = [
        false,
        false,
        false,
        false,
        false,
        turnNotMine,
        turnNotMine,
        turnNotMine,
        turnNotMine,
        turnNotMine,
    ];

    const actions = [
        () => {
            // Move Robber
            set((old) => ({
                ui: {
                    ...old.ui,
                    mapState: "picking area",
                },
            }));

            events.once("picked area", (index) => {
                socket?.emit(ServerCodes.MOVE_ROBBER, {
                    areaOffset: index,
                    useDevcard: true,
                });
            });
        },
        () => {},
        () => {},
        () => {},
        () => {},
    ];

    return (
        <div>
            <div className="relative flex scale-90 gap-2 px-7 pb-1 pt-3 items-center justify-around">
                {combine.map((value, index) => {
                    const color =
                        index < 5
                            ? convertions.matsColors[
                                  LOCAL_DECK_MATERIALS[
                                      index
                                  ].name.toLocaleLowerCase()
                              ]
                            : //   @ts-ignore
                              LOCAL_DECK_MATERIALS[index].color!;
                    const setting = isReactIcons[index]
                        ? {
                              color: color,
                              opacity: 0.2,
                              size: 25,
                          }
                        : {
                              stroke: color,
                              opacity: 0.2,
                              fill: color,
                              width: 30,
                              height: 30,
                          };
                    const rightIcon = LOCAL_DECK_MATERIALS[index].icon(setting);

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <button
                                    disabled={disabled[index]}
                                    onClick={() => {
                                        if (index > 4) {
                                            actions[index - 5]();
                                        }
                                    }}
                                    className={cn(
                                        "flex flex-row-reverse  items-center hover:opacity-100 opacity-65",
                                        index > 4 &&
                                            "not-disabled:cursor-pointer not-disabled:hover:scale-110 transition-transform not-disabled:hover:-translate-y-1"
                                    )}
                                >
                                    <p className="text-2xl w-5 -translate-x-4 translate-y-2 font-[Rubik] font-medium scale-70">
                                        {value}
                                    </p>
                                    {rightIcon}
                                </button>
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
