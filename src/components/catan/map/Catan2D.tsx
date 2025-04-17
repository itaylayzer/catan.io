import Areas from "@/config/data/ui/areas.json";
import Roads from "@/config/data/ui/roads.json";
import Settlements from "@/config/data/ui/settlements.json";
import { useCatanStore } from "@/store/useCatanStore";
import { useEffect, useRef, useState } from "react";
import { GoDotFill } from "react-icons/go";
import { convertions, matsToIcon } from "./configs";
import { Hex } from "./Hex";

export default function Catan2D() {
    const outerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const { materials, initialized } = useCatanStore();

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

    return !initialized ? null : (
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
                            ([index, { num, material }]) => (
                                <Hex
                                    key={index}
                                    color={convertions.matsColors[material]}
                                    className="absolute cursor-grab"
                                    style={{
                                        translate: `${Areas[index].x}px ${Areas[index].y}px`,
                                    }}
                                >
                                    <div className="flex gap-2 items-center font-mono font-bold text-2xl">
                                        <p>{num}</p>
                                        {matsToIcon[material]?.({
                                            fill: "white",
                                            stroke: "white",
                                            color: "white",
                                            width: 30,
                                            height: 30,
                                        })}
                                    </div>
                                </Hex>
                            )
                        )}

                        {Settlements.map(({ x, y }, index) => (
                            <div
                                data-id={index}
                                className="z-2 absolute"
                                style={{
                                    translate: `${x}px ${y}px`,
                                }}
                            >
                                <GoDotFill
                                    color={`#fff${index === 2 ? "f" : "0"}`}
                                    size={30}
                                    style={{ translate: `${-15}px ${-15}px` }}
                                />
                            </div>
                        ))}

                        <svg className="absolute -top-[50px] -left-[400px] w-[1000px] h-[1000px]">
                            {Roads.map(({ from, to }, index) => (
                                <line
                                    stroke={`#fff${
                                        [4, 5, 0, 10].includes(index) ? "f" : "0"
                                    }`}
                                    strokeWidth={5}
                                    x1={to.x + 400}
                                    x2={from.x + 400}
                                    y1={to.y + 50}
                                    y2={from.y + 50}
                                />
                            ))}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
}
