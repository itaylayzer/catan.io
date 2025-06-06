import { COLORS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useState } from "react";
import { StateOverlay } from "./StateOverlay";
import { PiHouseSimpleFill } from "react-icons/pi";

export function KnightPickPlayer() {
    const key = "KnightPickPlayer";

    const [hidden, setHidden] = useState(true);
    const [picks, setPicks] = useState<number[]>([]);

    const {
        onlines,
        ui: { events },
    } = useCatanStore();

    events.on("knight pick", (picks) => {
        setHidden(false);
        StateOverlay.instance?.show(key);

        setPicks(picks);
    });

    const confirm = (playerColor: number) => {
        return () => {
            setHidden(true);
            StateOverlay.instance?.hide(key);

            events.emit("knight picked", playerColor);
        };
    };

    return (
        <div
            className={cn(
                "hover:animate-none transition-all overflow-y-hidden relative duration-500 ease-in-out w-full z-50 rounded pt-3 pb-2 px-4",
                hidden
                    ? "h-0 opacity-0  pointer-events-none"
                    : "animate-pulse  pointer-events-auto opacity-100 outline-1 bg-accent"
            )}
        >
            <p className="font-[Rubik] text-center mb-2">
                Pick a Player you want to steal from!
            </p>

            <div className="flex flex-col gap-2 justify-center items-center">
                {picks.map((id) => {
                    const { name, color } = onlines.get(id)!;

                    return (
                        <div
                            onClick={confirm(id)}
                            className="cursor-pointer hover:scale-90 transition-[scale,opacity] hover:opacity-80 opacity-100 scale-100 rounded flex justify-center gap-2 px-2 py-1"
                        >
                            <PiHouseSimpleFill
                                opacity={1}
                                style={{
                                    filter: `drop-shadow(0px 0px 10px ${COLORS[color]}, drop-shadow(0px 0px 10px ${COLORS[color]}`,
                                    animationDelay: `${color / 2}s`,
                                    scale: "0.7",
                                }}
                                className="animate-pulse transition-all rotate-90"
                                color={COLORS[color]}
                            />
                            {name}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
