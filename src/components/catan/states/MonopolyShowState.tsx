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

export function MonopolyStateShow() {
    const key = "MonopolyStateShow";
    const [hidden, setHidden] = useState(true);
    const [mat, setMat] = useState<number>(0);
    // const [from, setFrom] = useState<number>(0);

    const {
        ui: { events },
        onlines,
        local,
    } = useCatanStore();

    events.on("monopol show", (from: number, mat: number) => {
        show(from, mat);
    });

    const show = (from: number, mat: number) => {
        setHidden(false);
        // setFrom(from);
        setMat(mat);
        StateOverlay.instance?.show(key);
    };
    const stop = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);
    };

    // global.show = show;

    const materialColor =
        convertions.matsColors[MATERIALS[mat].name.toLocaleLowerCase()];

    // const player = from === local.color ? local : onlines.get(from)!;
    // const { color: playerColor, name } = player;

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
                    {DEVELOPMENTS.at(-1)!.icon({
                        stroke: "white",
                        opacity: 0.1,
                        width: 500,
                        height: 500,
                        strokeWidth: 1,
                    })}{" "}
                </div>
                <p className="font-[Rubik] font-medium text-4xl drop-shadow-xl/25">
                    You've Been MONOPOLED!
                </p>
                <div className="h-2"></div>
                <div className="flex font-[Geist] drop-shadow-xl/25 font-medium text-2xl gap-2 justify-center items-center select-none">
                    {MATERIALS[mat].icon({
                        stroke: materialColor,
                        opacity: 1,
                        fill: materialColor,
                        width: 60,
                        height: 60,
                    })}
                    <p className="">{MATERIALS[mat].name}</p>
                </div>
                {/* <div className="flex font-[Geist] drop-shadow-lg text-3xl font-medium text-2xl gap-2 justify-center items-center select-none">
                    <p>From </p>
                    <p style={{ color: COLORS[playerColor] }}>{name}</p>
                </div> */}
            </div>
        </div>
    );
}
