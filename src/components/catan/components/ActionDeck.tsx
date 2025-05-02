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

export function ActionDeck() {
    const {
        client: { socket, id },
        turnId,
        ui: { dicesState, events },
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
            header: "Buy Mistery Card",
        },
        {
            icon: FaHandshakeSimple,
            header: "Trade",
        },
    ];

    const actions = [
        () => {
            dicesState === "mine"
                ? socket?.emit(ServerCodes.STOP_TURN)
                : socket?.emit(ServerCodes.ROLL);
        },
        () => {
            set({
                ui: {
                    events,
                    dicesState,
                    mapState: "picking edge",
                },
            });
            // ROADS
            socket;
        },
        () => {
            set({
                ui: {
                    events,
                    dicesState,
                    mapState: "picking vertex",
                },
            });
            // HOUSES
            socket;
        },
        () => {
            set({
                ui: {
                    events,
                    dicesState,
                    mapState: "picking vertex",
                },
            });
            // CITIES
            socket;
        },
        () => {
            // DEVCARD
            socket?.emit(ServerCodes.BUY_DEVCARD);
        },
        () => {
            // TRADE
            socket;
        },
    ];

    const allDisabled = turnId !== id || dicesState === "rolling";

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
            <div className="relative z-10 flex flex-row-reverse border-1 rounded-2xl bg-accent gap-5 px-4 pb-1 pt-2 scale-110 items-center justify-around">
                {ACTION_DECK_BUTTONS.map(({ header, icon, count }, index) => {
                    return (
                        <Tooltip key={header}>
                            <TooltipTrigger>
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
