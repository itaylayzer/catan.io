import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useState } from "react";
import { StateOverlay } from "./StateOverlay";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLORS, DEVELOPMENTS, MATERIALS } from "@/config/constants/ui";
import { convertions } from "../map/configs";
import { FaHandshakeAngle } from "react-icons/fa6";
import { PiHouseSimpleFill } from "react-icons/pi";

export function KnightSteal() {
    const key = "KnightSteal";

    const [hidden, setHidden] = useState(true);
    const [from, setFrom] = useState<number>(0);
    const [mat, setMat] = useState<number>(0);

    const {
        ui: { events },
        onlines,
        local,
    } = useCatanStore();

    events.on("knight steal", (from: number, mat: number) => {
        setHidden(false);
        StateOverlay.instance?.show(key);

        setMat(mat);
        setFrom(from);
    });

    const stop = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);
    };

    const matIcon = MATERIALS[mat].icon;
    const materialColor =
        convertions.matsColors[MATERIALS[mat].name.toLocaleLowerCase()];

    const player = onlines.get(from)! ?? { color: 0, name: "" };
    const { color: playerColor, name } = player;

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
                className="flex justify-center opacity-0 items-center flex-col"
                style={{
                    animation: hidden ? "" : "hop 4s cubic-bezier(0,.96,1,1)",
                }}
                onAnimationEnd={stop}
            >
                <div className="absolute top-[50%] z-50 left-[50%] -translate-x-[50%] -translate-y-[50%]">
                    <FaHandshakeAngle color="white" opacity={0.1} size={500} />
                </div>
                <p className="font-[Rubik] font-medium text-4xl drop-shadow-xl/25">
                    You've been stolen!
                </p>
                <div className="h-2"></div>

                <div className="flex font-[Geist] drop-shadow-xl/25 font-medium text-2xl gap-2 justify-center items-center select-none">
                    <PiHouseSimpleFill
                        opacity={1}
                        style={{
                            filter: `drop-shadow(0px 0px 10px ${COLORS[playerColor]}, drop-shadow(0px 0px 10px ${COLORS[playerColor]}`,
                            animationDelay: `${playerColor / 2}s`,
                            scale: "0.7",
                        }}
                        className="animate-pulse transition-all rotate-90"
                        color={COLORS[playerColor]}
                    />
                    <p>{name}</p>
                    <p>Stole from you</p>
                    {MATERIALS[mat].icon({
                        stroke: materialColor,
                        opacity: 1,
                        fill: materialColor,
                        width: 30,
                        height: 30,
                    })}
                    <p className="">{MATERIALS[mat].name}</p>
                </div>
            </div>
        </div>
    );
}
