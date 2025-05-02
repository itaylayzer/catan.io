import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { ServerCodes } from "@/config/constants/codes";
import { STORE_ICONS } from "@/config/constants/ui";
import { useCatanStore } from "@/store/useCatanStore";
import VMath from "@/utils/VMath";
import { FaStopwatch } from "react-icons/fa";
import { RiDiceFill } from "react-icons/ri";
import { FaHandshakeSimple } from "react-icons/fa6";

export function ActionDeck() {
    const {
        client: { socket, id },
        turnId,
        ui: { dicesState },
        bank,
    } = useCatanStore();

    const ACTION_DECK_BUTTONS = [
        {
            icon: dicesState === "mine" ? FaStopwatch : RiDiceFill,
            header: dicesState === "mine" ? "Stop Turn" : "Roll Dices",
        },
        {
            icon: STORE_ICONS.road,
            header: "Place Road",
            count: 1,
        },
        {
            icon: STORE_ICONS.settlement,
            header: "Place Settlement",
            count: 1,
        },
        {
            icon: STORE_ICONS.city,
            header: "Upgrade to City",
            count: 1,
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
            // ROADS
            socket;
        },
        () => {
            // HOUSES
            socket;
        },
        () => {
            // CITIES
            socket;
        },
        () => {
            // DEVCARD
            VMath(bank.devcards).sum() > 0 &&
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
        allDisabled || false,
        allDisabled || false,
        allDisabled || false,
        allDisabled || false,
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
                                        <p className="text-xl opacity-65 font-[Rubik] scale-85">
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
