import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { MATERIALS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import VMath from "@/utils/VMath";
import { useMemo, useState } from "react";
import { RiBankFill } from "react-icons/ri";
import { StateOverlay } from "./StateOverlay";

export function TwoYearOfPlentyState() {
    const key = "TwoYearOfPlentyState";
    const [hidden, setHidden] = useState(true);
    const [values, setValues] = useState([0, 0, 0, 0, 0]);

    const {
        local: { materials },
        bank: { materials: bankMaterials },
        ui: { events },
    } = useCatanStore();

    const leftCount = 2;

    const totalCount = useMemo(() => VMath(values).sum(), [values]);

    events.on("plenty", () => {
        setHidden(false);
        StateOverlay.instance?.show(key);
        setValues([0, 0, 0, 0, 0]);
    });

    const confirm = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);

        events.emit("plenty give", values);
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
                Choose 2 materials you want!
            </p>

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
                                        old[index] = Math.min(
                                            Math.min(
                                                old[index] +
                                                    leftCount -
                                                    totalCount,
                                                bankMaterials[index]
                                            ),
                                            old[index] + 1
                                        );
                                        setValues(old);
                                    }}
                                    onContextMenu={(e) => {
                                        e.preventDefault();

                                        const old = [...values];
                                        old[index] = Math.max(
                                            0,
                                            old[index] - 1
                                        );
                                        setValues(old);
                                    }}
                                    className="flex flex-row-reverse  items-center  cursor-pointer select-none"
                                >
                                    <p className="text-2xl absolute translate-x-2 text-green-900 translate-y-2 font-[Rubik] font-medium scale-70">
                                        {values[index]}
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

            <div className="flex flex-col items-center font-[Rubik] scale-90 text-xs opacity-50 justify-center mt-1">
                <div className="flex justify-center">
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
                <p>you cant take more then the bank has to offer</p>
            </div>

            <div className="flex justify-center">
                <Button
                    onClick={confirm}
                    disabled={totalCount != leftCount}
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
