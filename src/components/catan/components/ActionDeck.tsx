import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { ServerCodes } from "@/config/constants/codes";
import { useCatanStore } from "@/store/useCatanStore";
import VMath from "@/utils/VMath";
import { FaCity, FaDiceSix, FaMagic, FaRoad, FaStop } from "react-icons/fa";
import { FaHandshakeSimple, FaHouse } from "react-icons/fa6";

export function ActionDeck() {
    const {
        client: { socket, id },
        turnId,
        ui: { dicesState },
        bank,
    } = useCatanStore();

    const ACTION_DECK_BUTTONS = [
        {
            icon: dicesState === "mine" ? FaStop : FaDiceSix,
            header: dicesState === "mine" ? "Stop Turn" : "Roll Dices",
        },
        {
            icon: FaRoad,
            header: "Place Road",
            count: 1,
        },
        {
            icon: FaHouse,
            header: "Place House",
            count: 1,
        },
        {
            icon: FaCity,
            header: "Upgrade to City",
            count: 1,
        },
        {
            icon: FaMagic,
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
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="hover:animate-pulse cursor-pointer aspect-square hover:scale-125"
                                    onClick={actions[index]}
                                    disabled={disabled[index]}
                                >
                                    {count ? (
                                        <p className="text-xl opacity-65 font-mono font-bold ">
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
