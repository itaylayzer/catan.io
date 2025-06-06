import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ServerCodes } from "@/config/constants/codes";
import { STORE_ICONS } from "@/config/constants/ui";
import Store from "@/config/data/game/store.json";
import { useCatanStore } from "@/store/useCatanStore";
import VMath from "@/utils/VMath";
import { ReactNode, useState } from "react";
import { FaStopwatch } from "react-icons/fa";
import { FaHandshakeSimple } from "react-icons/fa6";
import { RiDiceFill } from "react-icons/ri";
import { MaterialNotify } from "../notifications/MaterialNotify";
import { TradeButton } from "./TradeButton";
import { cn } from "@/lib/utils";

export function ActionDeck() {
    const {
        client: { socket, id },
        turnId,
        ui: { dicesState, events, mapState },
        local,
        set,
        firstRounds,
    } = useCatanStore();

    const [sevenMode, setSevenMode] = useState(false);
    const cancelPickingDisabled =
        sevenMode || ["ready", "loading", "picking 2 edges"].includes(mapState);

    events.on("dock 7 free", () => {
        console.log('action deck 7 free')

        setSevenMode(false);
    });

    events.on("dock 7", () => {
        console.log('action deck 7 mode')
        setSevenMode(true);
    });

    const ACTION_DECK_BUTTONS = [
        {
            icon: dicesState === "mine" ? FaStopwatch : RiDiceFill,
            header: dicesState === "mine" ? "Stop Turn" : "Roll Dices",
        },
        {
            icon: STORE_ICONS.road,
            header: "Place Road",
            count: local.amounts.road,
        },
        {
            icon: STORE_ICONS.settlement,
            header: "Place Settlement",
            count: local.amounts.settlement,
        },
        {
            icon: STORE_ICONS.city,
            header: "Upgrade to City",
            count: local.amounts.city,
        },
        {
            icon: STORE_ICONS.devcard,
            header: "Buy Development Card",
        },
        {
            icon: FaHandshakeSimple,
            header: "Trade",
        },
    ];

    const noParent = (children: ReactNode, disabled: boolean) => children;
    const { parent } = TradeButton();
    const parents = [noParent, noParent, noParent, noParent, noParent, parent];

    const actions = [
        () => {
            set((old) => ({
                ui: { ...old.ui, mapState: "ready" },
            }));

            dicesState === "mine"
                ? socket?.emit(ServerCodes.STOP_TURN)
                : socket?.emit(ServerCodes.ROLL);
        },
        () => {
            // ROADS
            set((old) => ({
                ui: { ...old.ui, mapState: "picking edge" },
            }));

            events.once("picked edge", (from: number, to: number) => {
                socket?.emit(ServerCodes.BUY_ROAD, [from, to]);

                set((old) => ({
                    ui: { ...old.ui, mapState: "ready" },
                }));
            });
        },
        () => {
            set((old) => ({
                ui: { ...old.ui, mapState: "picking vertex" },
            }));

            events.once("picked vertex", (index: number) => {
                socket?.emit(ServerCodes.BUY_SETTLEMENT, index);

                set((old) => ({
                    ui: { ...old.ui, mapState: "ready" },
                }));
            });
        },
        () => {
            // CITY
            set((old) => ({
                ui: { ...old.ui, mapState: "picking vertex upgrade" },
            }));

            events.once("picked vertex upgrade", (index: number) => {
                socket?.emit(ServerCodes.BUY_CITY, index);

                set((old) => ({
                    ui: { ...old.ui, mapState: "ready" },
                }));
            });
        },
        () => {
            // DEVCARD
            set((old) => ({
                ui: { ...old.ui, mapState: "ready" },
            }));

            socket?.emit(ServerCodes.BUY_DEVCARD);
        },
        () => {
            socket?.emit(ServerCodes.REQUEST_TRADES);
        },
    ];


    const turnNotMine = dicesState !== "mine";
    const allDisabled =
        mapState === "picking area" ||
        mapState === "picking 2 edges" ||
        turnId !== id ||
        dicesState === "rolling";
    const disabled = [
        allDisabled,
        turnNotMine ||
            allDisabled ||
            !VMath(local.materials).available(Store.road),
        turnNotMine ||
            allDisabled ||
            !VMath(local.materials).available(Store.settlement),
        turnNotMine ||
            allDisabled ||
            !VMath(local.materials).available(Store.city),
        turnNotMine ||
            allDisabled ||
            !VMath(local.materials).available(Store.devcard),
        turnNotMine || allDisabled || false,
    ];

    return (
        <div
            className={cn(
                "transition-[opacity,scale] duration-1000",
                firstRounds && "opacity-0 scale-80 pointer-events-none"
            )}
        >
            <MaterialNotify />

            <div className="relative z-30 flex flex-row-reverse border-1 rounded-2xl bg-accent gap-5 px-4 pb-1 pt-2 scale-110 items-center justify-around">
                <div className="absolute -top-[32px]">
                    <Button
                        variant="link"
                        className="cursor-pointer disabled:pointer-events-none disabled:opacity-0 opacity-50 hover:opacity-80 transition-opacity"
                        disabled={cancelPickingDisabled}
                        onClick={() => {
                            set((old) => ({
                                ui: { ...old.ui, mapState: "ready" },
                            }));
                        }}
                    >
                        cancel picking
                    </Button>
                </div>
                {ACTION_DECK_BUTTONS.map(({ header, icon, count }, index) => {
                    return parents[index](
                        <Tooltip key={header}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="hover:animate-pulse cursor-pointer aspect-square hover:scale-125"
                                    onClick={actions[index]}
                                    disabled={disabled[index]}
                                >
                                    {count ? (
                                        <p className="text-md opacity-65 font-[Rubik]">
                                            {count}
                                        </p>
                                    ) : null}
                                    {icon({ color: "white", size: 30 })}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{header}</p>
                            </TooltipContent>
                        </Tooltip>,
                        disabled[index]
                    );
                })}
            </div>
        </div>
    );
}
