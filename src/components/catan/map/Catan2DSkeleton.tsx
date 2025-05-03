import Areas from "@/config/data/ui/areas.json";
import Roads from "@/config/data/ui/roads.json";
import Settlements from "@/config/data/ui/settlements.json";
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
import { Material } from "@/types/materials";
import { ArrayShuffle } from "@/utils/ArrayShuffle";
import { AREAS } from "@/config/constants/game";

const MIDDLE_INDEX = 9;
const state = "" as string;
const robberArea = MIDDLE_INDEX;
const callback = (...data: any[]) => {};
const materials = new Map<number, Record<"num" | "material", number>>();

const materialsNumbers = [
    Material.WOOD,
    Material.WOOD,
    Material.WOOD,
    Material.WOOD,
    Material.WOOL,
    Material.WOOL,
    Material.WOOL,
    Material.WOOL,
    Material.WHEAT,
    Material.WHEAT,
    Material.WHEAT,
    Material.WHEAT,
    Material.BRICK,
    Material.BRICK,
    Material.BRICK,
    Material.ORE,
    Material.ORE,
    Material.ORE,
];
const numbers = [2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12];

ArrayShuffle(materialsNumbers);
ArrayShuffle(numbers);

for (let offset = 0; offset < AREAS - 1; offset++) {
    const middleOrAfter = offset >= MIDDLE_INDEX;

    materials.set(offset + +middleOrAfter, {
        material: materialsNumbers.shift()!,
        num: numbers.shift()!,
    });
}
materials.set(MIDDLE_INDEX, {
    material: 5,
    num: 7,
});

export default function Catan2DSkeleton() {
    const outerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

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

    return (
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
                                    state === "picking area" &&
                                    robberArea !== index
                                        ? `animate-pulse hover:animate-none hover:scale-95 transition-transform cursor-pointer z-10`
                                        : `pointer-events-none`;

                                return (
                                    <Hex
                                        onClick={() => {
                                            console.log("picked area:", index);

                                            state === "picking area" &&
                                                callback(index);
                                        }}
                                        key={index}
                                        color={
                                            convertions.matsColors[
                                                convertions.matsNaming[material]
                                            ]
                                        }
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
                                                    {matsToIcon[
                                                        convertions.matsNaming[
                                                            material
                                                        ]
                                                    ]?.({
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
                            const used = [] as number[];
                            const color = `#fff${
                                used.includes(index)
                                    ? "f"
                                    : state === "picking vertex"
                                    ? "8"
                                    : "0"
                            }`;
                            const className =
                                state === "picking vertex" &&
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

                                            state === "picking vertex" &&
                                                callback([index]);
                                        }}
                                    />
                                </div>
                            );
                        })}

                        <svg className="absolute -top-[50px] -left-[400px] w-[1000px] h-[1000px]">
                            {Roads.map(({ from, to }, index) => {
                                const used = [] as number[];

                                const stroke = `#fff${
                                    used.includes(index)
                                        ? "f"
                                        : state === "picking edge"
                                        ? "8"
                                        : "0"
                                }`;
                                const className =
                                    state === "picking edge" &&
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

                                            state === "picking edge" &&
                                                callback([index, from, to]);
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
