import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLORS, MATERIALS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useState } from "react";
import { StateOverlay } from "./StateOverlay";
import { ServerCodes } from "@/config/constants/codes";
import { FaHandshakeSimple } from "react-icons/fa6";

import { FaFaceGrinWide, FaRegFaceSadTear } from "react-icons/fa6";

export function PlayerTrade() {
    const key = "PlayerTrade";

    const [hidden, setHidden] = useState(true);
    const [values, setValues] = useState([0, 0, 0, 0, 0]);
    const [pickedPlayers, setPickedPlayers] = useState<Set<number>>(new Set());

    const {
        local: { materials },
        ui: { events },
        client: { socket },
        onlines: onlinesMap,
    } = useCatanStore();

    events.on("offer trade", () => {
        if (onlinesMap.size === 0) return;

        setHidden(false);
        StateOverlay.instance?.show(key);

        setValues([0, 0, 0, 0, 0]);
        setPickedPlayers(new Set());
    });

    const confirm = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);

        socket?.emit(ServerCodes.OFFER_TRADE, {
            players: Array.from(pickedPlayers.values()),
            mats: values,
        });
    };

    const hasPositive = values.some((value) => value > 0);
    const hasNegative = values.some((value) => value < 0);
    const noPickedPlayers = pickedPlayers.size === 0;

    const disabled = !hasPositive || !hasNegative || noPickedPlayers;

    const onlines = Array.from(onlinesMap.values());

    return (
        <div
            className={cn(
                " hover:animate-none transition-all overflow-y-hidden relative duration-500 ease-in-out w-full z-50 rounded pt-3 pb-2 px-4",
                hidden
                    ? "h-0 opacity-0  pointer-events-none"
                    : "animate-pulse  pointer-events-auto opacity-100 outline-1 bg-accent"
            )}
        >
            <p className="font-[Rubik] text-center">Offer a player trade</p>
            <div className="flex font-[Rubik] scale-90 text-xs opacity-50 justify-center mb-1">
                <p>red is to offer | green is wanted</p>
            </div>

            <div className="flex gap-5 justify-center">
                {MATERIALS.map((mat, index) => {
                    const setting = {
                        stroke: "white",
                        opacity: 0.2,
                        fill: "white",
                        width: 30,
                        height: 30,
                    };

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <div
                                    onClick={() => {
                                        const old = [...values];
                                        old[index] = old[index] + 1;
                                        setValues(old);
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();

                                        const old = [...values];

                                        old[index] = Math.max(
                                            -materials[index],
                                            old[index] - 1
                                        );

                                        setValues(old);
                                    }}
                                    className="flex flex-row-reverse items-center  cursor-pointer select-none"
                                >
                                    <p
                                        className={cn(
                                            "text-2xl absolute translate-x-2 translate-y-2 font-[Rubik] font-medium scale-70",
                                            values[index] < 0
                                                ? "text-red-400"
                                                : values[index] > 0
                                                ? "text-green-900"
                                                : ""
                                        )}
                                    >
                                        {values[index] < 0
                                            ? -1 * values[index]
                                            : values[index]}
                                    </p>
                                    {mat.icon(setting)}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{mat.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>

            <div className="flex font-[Rubik] scale-90 text-xs opacity-50 justify-center mt-1">
                <Tooltip>
                    <TooltipTrigger className="underline mr-[0.5ch]">
                        RMB
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Right Mouse Button</p>
                    </TooltipContent>
                </Tooltip>
                <p> to give up more | </p>
                <Tooltip>
                    <TooltipTrigger className="underline mx-[0.5ch]">
                        LMB
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Left Mouse Button</p>
                    </TooltipContent>
                </Tooltip>
                <p> to give up less</p>
            </div>

            <div className="h-2"></div>
            <p className="text-center">Pick players</p>
            <div className="flex gap-3 justify-center">
                {onlines.map((online) => {
                    const picked = pickedPlayers.has(online.color);

                    const icon = [FaRegFaceSadTear, FaFaceGrinWide][+picked];
                    const color = COLORS[online.color];

                    return (
                        <Tooltip>
                            <TooltipTrigger
                                onClick={() => {
                                    if (picked) {
                                        pickedPlayers.delete(online.color);
                                    } else {
                                        pickedPlayers.add(online.color);
                                    }

                                    setPickedPlayers(new Set(pickedPlayers));
                                }}
                                className={cn(
                                    "opacity-40 cursor-pointer scale-90 transition-[scale,opacity]",
                                    picked &&
                                        `opacity-80 bg-[${color}] scale-100`
                                )}
                            >
                                {icon({
                                    color,
                                    size: 25,
                                })}
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{online.name}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={confirm}
                    disabled={disabled}
                    className="cursor-pointer select-none mb-0 pb-0"
                    variant="link"
                >
                    <FaHandshakeSimple />
                    {!hasPositive
                        ? "You dont want any materials"
                        : !hasNegative
                        ? "You dont offer any materials"
                        : noPickedPlayers
                        ? "You offer the trade to no one"
                        : "confirm"}
                </Button>
            </div>
        </div>
    );
}
