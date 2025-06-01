import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { ServerCodes } from "@/config/constants/codes";
import { STORE_ICONS } from "@/config/constants/ui";
import { useCatanStore } from "@/store/useCatanStore";
import { FaStopwatch } from "react-icons/fa";
import { RiDiceFill } from "react-icons/ri";
import { FaHandshakeSimple } from "react-icons/fa6";
import VMath from "@/utils/VMath";
import Store from "@/config/data/game/store.json";
import { MaterialNotify } from "../notifications/MaterialNotify";
import { TradeButton } from "./TradeButton";
import { ReactNode } from "react";

export function ActionDeck() {
    const {
        client: { socket, id },
        turnId,
        ui: { dicesState, events, mapState },
        local,
        set,
    } = useCatanStore();

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

    const noParent = (children: ReactNode) => children;
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
        // turnNotMine||
        mapState === "picking area" ||
        mapState === "picking 2 edges" ||
        turnId !== id ||
        dicesState === "rolling";
    const disabled = [
        allDisabled,
        allDisabled || !VMath(local.materials).available(Store.road),
        allDisabled || !VMath(local.materials).available(Store.settlement),
        allDisabled || !VMath(local.materials).available(Store.city),
        allDisabled || !VMath(local.materials).available(Store.devcard),
        allDisabled || false,
    ];

    return (
        <div>
            <MaterialNotify />

            <div className="relative z-30 flex flex-row-reverse border-1 rounded-2xl bg-accent gap-5 px-4 pb-1 pt-2 scale-110 items-center justify-around">
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
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
