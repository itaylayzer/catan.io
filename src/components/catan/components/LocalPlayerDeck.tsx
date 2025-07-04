import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import {
    DEVELOPMENTS,
    DEVELOPMENTS_DESCRIPTIONS,
    LOCAL_DECK_MATERIALS,
} from "@/config/constants/ui";
import { useRender } from "@/hooks/useRender";
import { useCatanStore } from "@/store/useCatanStore";
import { ReactNode, useEffect } from "react";
import { convertions } from "../map/configs";
import { cn } from "@/lib/utils";
import { ServerCodes } from "@/config/constants/codes";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";

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
        local: {
            materials,
            devcards,
            amounts: { road: roudsAmounts },
        },
        ui: { events, dicesState, mapState },
        set,
        client: { socket },
        firstRounds,
    } = useCatanStore();

    const render = useRender();

    useEffect(() => {
        events.on("render decks", render);
        return () => {
            events.off("render decks", render);
        };
    }, [render]);

    const combine = [...materials, ...devcards];

    const allDisabled = dicesState !== "mine" || mapState === "picking 2 edges";
    const disabled = [
        true,
        true,
        true,
        true,
        true,
        allDisabled,
        true,
        allDisabled || roudsAmounts === 0,
        allDisabled,
        allDisabled,
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
        () => {
            // ROADS
            set((old) => ({
                ui: { ...old.ui, mapState: "picking edge" },
            }));

            events.once("picked edge", (from: number, to: number) => {
                set((old) => ({
                    ui: { ...old.ui, mapState: "ready" },
                }));

                socket?.emit(ServerCodes.DEV_ROADS, [from, to]);

                setTimeout(() => {
                    set((old) => ({
                        ui: { ...old.ui, mapState: "picking 2 edges" },
                    }));

                    events.once("picked edge", (from: number, to: number) => {
                        socket?.emit(ServerCodes.DEV_ROADS, [from, to]);

                        set((old) => ({
                            ui: { ...old.ui, mapState: "ready" },
                        }));
                    });
                }, 200);
            });
        },
        () => {
            events.emit("plenty");

            events.once("plenty give", (values) => {
                socket?.emit(ServerCodes.DEV_YEAROFPLENTY, values);
            });
        },
        () => {
            events.emit("monopoly");

            events.once("monopoly give", (values) => {
                socket?.emit(ServerCodes.DEV_MONOPOL, values);
            });
        },
    ];

    return (
        <div
            className={cn(
                "transition-[opacity,scale] duration-1000",
                firstRounds && "opacity-0 scale-80 pointer-events-none"
            )}
        >
            <div className="relative flex scale-90 gap-2 px-7 pb-1 pt-3 items-center justify-around">
                {combine.map((value, index) => {
                    if (LOCAL_DECK_MATERIALS[index] === undefined) return null;

                    const isDevCard = index > 4;
                    const { name, icon } = LOCAL_DECK_MATERIALS[index];

                    const color = !isDevCard
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

                    const cardSetting = isReactIcons[index]
                        ? {
                              color: color,
                              opacity: 1,
                              size: 25,
                          }
                        : {
                              stroke: color,
                              opacity: 1,
                              fill: color,
                              width: 30,
                              height: 30,
                          };

                    const rightIcon = icon(setting);
                    const cardIcon = icon({
                        ...cardSetting,
                        style: {
                            filter: `drop-shadow(0px 0px 20px ${color})`,
                        },
                    });

                    const element = (
                        <button
                            disabled={
                                disabled[index] ||
                                value === 0 ||
                                value === undefined ||
                                value === null
                            }
                            onClick={() => {
                                actions[index - 5]();
                            }}
                            className={cn(
                                "flex flex-row-reverse  items-center hover:opacity-100 opacity-65",
                                index > 4 &&
                                    "not-disabled:cursor-pointer not-disabled:hover:scale-110 transition-transform not-disabled:hover:-translate-y-1"
                            )}
                        >
                            <p className="text-2xl w-5 -translate-x-4 translate-y-2 font-[Rubik] font-medium scale-70">
                                {value ?? 0}
                            </p>
                            {rightIcon}
                        </button>
                    );

                    const tooltip = (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>{element}</TooltipTrigger>
                            <TooltipContent>
                                <p>{name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );

                    const cardParent = (
                        <HoverCard openDelay={0.5} closeDelay={0} key={index}>
                            <HoverCardTrigger asChild>
                                {element}
                            </HoverCardTrigger>
                            <HoverCardContent className="pointer-events-none bg-accent w-60 flex gap-1 flex-col">
                                <div className="flex justify-center gap-3">
                                    <div className="scale-70">{cardIcon}</div>
                                    <p className="font-[Rubik]">{name}</p>
                                </div>
                                <div className="px-7 mb-3">
                                    <hr />
                                </div>
                                <p className="flex-1 px-2 font-light font-[Geist] text-center text-pretty text-sm opacity-60 flex justify-center items-center">
                                    {DEVELOPMENTS_DESCRIPTIONS[index - 5]}
                                </p>
                                <div className="px-7 mt-1">
                                    <hr />
                                </div>
                                <p className="text-center text-xs font-[Rubik] opacity-35">
                                    Development card
                                </p>
                            </HoverCardContent>
                        </HoverCard>
                    );
                    return isDevCard ? cardParent : tooltip;
                })}
            </div>
        </div>
    );
}
