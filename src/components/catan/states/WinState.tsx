import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLORS, DEVELOPMENTS, ONLINE_STATS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { StateOverlay } from "./StateOverlay";
import { TiMinus } from "react-icons/ti";
import { FaCrown } from "react-icons/fa";
import { TbRectangleVerticalFilled } from "react-icons/tb";

const vpdevcardShadow = "drop-shadow(0px 0px 5px (#ffffff66))";
export function VpDevcard() {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <div className="relative  w-[30px] h-[30px] transition-opacity">
                    {ONLINE_STATS[0].icon({
                        size: 15,
                        color: "black",

                        className: "absolute top-0 z-20 translate-[7.5px]",
                    })}
                    <TbRectangleVerticalFilled
                        color="white"
                        size={30}
                        style={{
                            filter: vpdevcardShadow,
                        }}
                        className="absolute top-0 z-10"
                    />
                </div>
            </TooltipTrigger>
            <TooltipContent>
                <p>Largest Army Card</p>
            </TooltipContent>
        </Tooltip>
    );
}

export function WinState() {
    const key = "WinState";
    const router = useRouter();

    const [hidden, setHidden] = useState(true);
    const [winnerId, setWinnerId] = useState<number>(0);
    const [players, setPlayers] = useState<
        { id: number; vp: number; vpdc: number }[]
    >([]);

    const {
        ui: { events },
        onlines,
        local,
    } = useCatanStore();

    events.on(
        "win",
        (id: number, players: { id: number; vp: number; vpdc: number }[]) => {
            setHidden(false);
            StateOverlay.instance?.show(key);

            setWinnerId(id);
            setPlayers(players);
        }
    );

    useEffect(() => {
        setHidden(true);
        StateOverlay.instance?.hide(key);
    }, []);

    if (players.length === 0) return null;

    const clients = [local, ...Array.from(onlines.values())].map(
        ({ color, name }) => {
            const { vp, vpdc } = players.find(
                (xplayer) => xplayer.id === color
            )!;
            return {
                name,
                color,
                vp,
                vpdc,
            };
        }
    );

    const winner = clients.find((p) => p.color === winnerId)!;

    return (
        <div
            className={cn(
                "absolute top-[50%] z-50 left-[50%] -translate-x-[50%] -translate-y-[50%]",
                hidden
                    ? "h-0 opacity-0  pointer-events-none"
                    : "pointer-events-auto"
            )}
        >
            <div
                className="flex justify-center  items-center flex-col"
                style={{
                    animation: hidden ? "" : "show 4s cubic-bezier(0,.96,1,1)",
                }}
            >
                <div className="absolute flex gap-2 items-center drop-shadow-lg/50 font-[Rubik] text-2xl font-medium top-[50%] z-50 left-[50%] -translate-x-[50%] -translate-y-[50%]">
                    <div className="absolute top-[50%] z-50 left-[50%] -translate-x-[50%] -translate-y-[50%]">
                        {FaCrown({
                            size: 500,
                            color: "#050505",
                            opacity: 1,
                            style: {
                                filter: "drop-shadow(0px 0px 50px #ffffff11) drop-shadow(0px 0px 2px #222)",
                            },
                        })}{" "}
                    </div>

                    <div
                        style={{ translate: "0px 175px" }}
                        className="flex justify-center items-center z-60 w-[305px]"
                    >
                        <div
                            style={{
                                color: ONLINE_STATS[0].color,
                                filter: ONLINE_STATS[0].shadow!,
                            }}
                            className="flex gap-2 items-center"
                        >
                            {winner.vp}
                            <Tooltip>
                                <TooltipTrigger>
                                    {ONLINE_STATS[0].icon({
                                        color: ONLINE_STATS[0].color,
                                        style: {
                                            filter: ONLINE_STATS[0].shadow!,
                                        },
                                    })}
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Victory Points</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div
                            style={{
                                backgroundColor: COLORS[winner.color + 1],
                            }}
                            className="z-60 flex-1 h-1.25 opacity-50 mx-7 rounded-full"
                        ></div>
                        <div
                            style={{
                                color: "white",
                                filter: vpdevcardShadow,
                            }}
                            className="flex gap-2 items-center"
                        >
                            {winner.vpdc}

                            <Tooltip>
                                <TooltipTrigger>
                                    <VpDevcard />
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Victory Points Development Card</p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>
                </div>

                <div className="h-75"></div>
                <h1 className="font-[Rubik] z-60 font-light opacity-30 text-2xl">
                    And we got a winner
                </h1>
                <div className="flex flex-col gap-2 items-center">
                    <h1 className={`font-[Rubik] z-60 font-medium text-7xl`}>
                        {winner.name}
                    </h1>
                </div>

                <div className="h-50 flex flex-col justify-end">
                    <div className="flex -translate-y-15 z-60 justify-center items-center">
                        <Button
                            variant="link"
                            onClick={() => {
                                router.push("/");
                            }}
                            className="cursor-pointer z-60"
                        >
                            <FaAngleLeft /> Return to home page
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
