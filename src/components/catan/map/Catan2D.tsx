import Areas from "@/config/data/ui/areas.json";
import Roads from "@/config/data/ui/roads.json";
import Settlements from "@/config/data/ui/settlements.json";
import { useCatanStore } from "@/store/useCatanStore";
import { useEffect, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { convertions, matsToIcon } from "./configs";
import { Hex } from "./Hex";
import { cn } from "@/lib/utils";
import { FaRegChessPawn } from "react-icons/fa6";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Catan2D() {
    const outerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const {
        materials,
        robberArea,
        ui: { mapState },
    } = useCatanStore();

    console.log("mapState", mapState);

    // Dynamic scaling effect
    useEffect(() => {
        const updateScale = () => {
            if (outerRef.current && boardRef.current) {
                const outer = outerRef.current.getBoundingClientRect();
                const board = boardRef.current.getBoundingClientRect();

                const scaleX = outer.width / board.width;
                const scaleY = outer.height / board.height;

                // Choose the smaller scale to fit within the viewport
                setScale(Math.min(scaleX, scaleY, 1)); // Prevent upscaling
            }
        };

        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    return mapState === "loading" ? null : (
        <div className="relative w-full h-full overflow-hidden" ref={outerRef}>
            <div
                className="absolute"
                style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) scale(${scale})`,
                    transformOrigin: "top left",
                }}
            >
                <div ref={boardRef} className="relative w-fit h-fit">
                    <div
                        style={{
                            translate: `-215px -322.5px`,
                        }}
                    >
                        {Array.from(materials.entries()).map(
                            ([index, { num, material }]) => {
                                const className =
                                    mapState === "picking area" &&
                                    robberArea !== index
                                        ? `animate-pulse opacity-30 hover:opacity-75 hover:animate-none hover:scale-90 scale-95 transition-[transform,opacity] cursor-pointer z-10`
                                        : `pointer-events-none`;

                                return (
                                    <Hex
                                        onClick={() => {
                                            console.log("picked area:", index);

                                            mapState === "picking area";
                                            // &&callback(index);
                                        }}
                                        key={index}
                                        color={convertions.matsColors[material]}
                                        className={cn("absolute", className)}
                                        style={{
                                            animationDelay: `${index / 4}s`,
                                            translate: `${Areas[index].x}px ${Areas[index].y}px`,
                                        }}
                                    >
                                        <div className="flex gap-2 items-center font-[Rubik] scale-85 font-bold text-2xl">
                                            {index === robberArea ? (
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <FaRegChessPawn
                                                            className="z-10"
                                                            color="white"
                                                            size={26}
                                                        />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Robber</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : null}
                                            <p>{num}</p>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    {matsToIcon[material]?.({
                                                        fill: "white",
                                                        stroke: "white",
                                                        color: "white",
                                                        width: 30,
                                                        height: 30,
                                                    })}
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>{material}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </Hex>
                                );
                            }
                        )}

                        {Settlements.map(({ x, y }, index) => {
                            const used = [4, 5, 0, 10];
                            const color = `#fff${
                                used.includes(index)
                                    ? "f"
                                    : mapState === "picking vertex"
                                    ? "8"
                                    : "0"
                            }`;
                            const className =
                                mapState === "picking vertex" &&
                                !used.includes(index)
                                    ? "animate-pulse hover:scale-95 hover:animate-none cursor-pointer"
                                    : "pointer-events-none";

                            return (
                                <div
                                    data-id={index}
                                    className={cn(
                                        "z-2 absolute transition-transform",
                                        className
                                    )}
                                    style={{
                                        translate: `${x}px ${y}px`,
                                    }}
                                >
                                    <GoDotFill
                                        color={color}
                                        size={30}
                                        style={{
                                            translate: `${-15}px ${-15}px`,
                                        }}
                                        onClick={() => {
                                            console.log(
                                                "picked vertex:",
                                                index
                                            );

                                            mapState === "picking vertex";
                                            // &&callback([index]);
                                        }}
                                    />
                                </div>
                            );
                        })}

                        <svg className="absolute -top-[50px] -left-[400px] w-[1000px] h-[1000px]">
                            {Roads.map(({ from, to }, index) => {
                                const used = [4, 5, 0, 10];

                                const stroke = `#fff${
                                    used.includes(index)
                                        ? "f"
                                        : mapState === "picking edge"
                                        ? "8"
                                        : "0"
                                }`;
                                const className =
                                    mapState === "picking edge" &&
                                    !used.includes(index)
                                        ? "animate-pulse hover:animate-none cursor-pointer"
                                        : "pointer-events-none";
                                return (
                                    <line
                                        stroke={stroke}
                                        className={className}
                                        strokeWidth={5}
                                        x1={to.x + 400}
                                        x2={from.x + 400}
                                        y1={to.y + 50}
                                        y2={from.y + 50}
                                        onClick={() => {
                                            console.log("picked edge:", index);

                                            mapState === "picking edge";
                                            // &&callback([index, from, to]);
                                        }}
                                    />
                                );
                            })}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
