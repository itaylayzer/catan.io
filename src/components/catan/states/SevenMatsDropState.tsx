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
import { useEffect, useMemo, useState } from "react";
import { RiBankFill } from "react-icons/ri";
import { StateOverlay } from "./StateOverlay";

export function SevenMatsDropState() {
    const key = "SevenMatsDropState";
    const [hidden, setHidden] = useState(true);
    const [values, setValues] = useState([0, 0, 0, 0, 0]);

    const {
        local: { materials },
        ui: { events },
    } = useCatanStore();

    const leftCount = useMemo(
        () => Math.floor(VMath(materials).sum() / 2),
        [materials]
    );

    const totalCount = useMemo(() => VMath(values).sum(), [values]);

    events.on("7", () => {
        setHidden(false);
        StateOverlay.instance?.show(key);
        setValues([0, 0, 0, 0, 0]);
    });

    const confirm = () => {
        setHidden(true);
        StateOverlay.instance?.hide(key);

        events.emit("7 give", values);
    };

    return (
        <div
            style={{ transition: "height 1s ease-out, opacity 1s" }}
            className={cn(
                " animate-pulse hover:animate-none overflow-y-hidden relative duration-500 ease-in-out w-full z-50 rounded pt-3 pb-2 px-4",
                hidden ? "h-0" : "outline-1 bg-accent"
            )}
        >
            <p className="font-[Rubik] text-center mb-2">
                You have more then 6 materials
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
                                                materials[index]
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
                                    <p className="text-2xl absolute translate-x-2 text-red-400 translate-y-2 font-[Rubik] font-medium scale-70">
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

            <div className="flex justify-center">
                <Button
                    onClick={confirm}
                    disabled={totalCount != leftCount}
                    className="cursor-pointer select-none mb-0 pb-0"
                    variant="link"
                >
                    <RiBankFill />
                    {totalCount == leftCount
                        ? `Retrieve ${totalCount} Materials!`
                        : `Retrieve more ${leftCount - totalCount} materials!`}
                </Button>
            </div>
        </div>
    );
}
