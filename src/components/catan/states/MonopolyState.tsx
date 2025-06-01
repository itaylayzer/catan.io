import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MATERIALS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useState } from "react";
import { StateOverlay } from "./StateOverlay";
import { convertions } from "../map/configs";

export function MonopolyState() {
    const key = "MonopolyState";
    const [hidden, setHidden] = useState(true);
    const [value, setValue] = useState<number>();

    const {
        ui: { events },
    } = useCatanStore();

    events.on("monopoly", () => {
        setHidden(false);
        StateOverlay.instance?.show(key);
        setValue(undefined);
    });

    const confirm = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);

        events.emit("monopoly give", value);
    };

    const cancel = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);
    };

    return (
        <div
            className={cn(
                " hover:animate-none transition-all overflow-y-hidden relative duration-500 ease-in-out w-full z-50 rounded pt-3 pb-2 px-4",
                hidden
                    ? "h-0 opacity-0  pointer-events-none"
                    : "animate-pulse  pointer-events-auto opacity-100 outline-1 bg-accent"
            )}
        >
            <p className="font-[Rubik] text-center mb-2">
                Choose Material you want to Monopol!
            </p>

            <div className="flex gap-5 justify-center">
                {MATERIALS.map((mat, index) => {
                    const color =
                        value === index
                            ? convertions.matsColors[
                                  mat.name.toLocaleLowerCase()
                              ]
                            : "white";
                    const setting = {
                        stroke: color,
                        opacity: value === index ? 1 : 0.2,
                        fill: color,
                        width: 30,
                        height: 30,
                    };

                    return (
                        <Tooltip key={index}>
                            <TooltipTrigger asChild>
                                <div
                                    onClick={() => {
                                        if (value === index) {
                                            setValue(undefined);
                                        } else setValue(index);
                                    }}
                                    className={cn(
                                        "flex flex-row-reverse  items-center  cursor-pointer select-none",
                                        value === index && "scale-90"
                                    )}
                                >
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

            <div className="flex justify-center">
                <Button
                    onClick={confirm}
                    disabled={value === undefined}
                    className="cursor-pointer select-none mb-0 pb-0"
                    variant="link"
                >
                    confirm
                </Button>
                <Button
                    onClick={cancel}
                    className="cursor-pointer select-none mb-0 pb-0"
                    variant="link"
                >
                    cancel
                </Button>
            </div>
        </div>
    );
}
