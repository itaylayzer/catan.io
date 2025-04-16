import { BsHexagonFill } from "react-icons/bs";
import { ReactNode, useEffect, useRef, useState } from "react";
import SVGBrick from "@/components/svg/custom/SVGBrick";
import SVGOre from "@/components/svg/custom/SVGOre";
import SVGWheet from "@/components/svg/custom/SVGWheet";
import SVGWool from "@/components/svg/custom/SVGWhool";
import SVGWood from "@/components/svg/custom/SVGWood";
import { cn } from "@/lib/utils";
import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { useCatanStore } from "@/store/useCatanStore";
import { DevcardList } from "@/types/materials";

const convertions = {
    matsColors: {
        wood: "#16a34a",
        wool: "#65a30d",
        wheat: "#ca8a04",
        blank: "#404040",
        brick: "#b91c1c",
        ore: "#a8a29e",
    } as Record<string, string>,
    matsNaming: ["wood", "wool", "wheat", "brick", "ore", "blank"],
};
const rows = [3, 4, 5, 4, 3];

const fixing = { x: 0.86, z: 0.75 };
const spacing = 1.1;
const size = 150;
const round = size / 2;

const matsToIcon: Record<
    string,
    ((props: React.SVGProps<SVGSVGElement>) => JSX.Element) | null
> = {
    wood: SVGWood,
    wool: SVGWool,
    wheat: SVGWheet,
    brick: SVGBrick,
    ore: SVGOre,
    blank: null,
};

function Hex(
    props: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > & { color: string; children: ReactNode }
) {
    const { color, children, ...others } = props;
    const padding = 5;

    const [hover, setHover] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const onEnter = () => {
            setHover(true);
        };
        const onLeave = () => {
            setHover(false);
        };

        container.addEventListener("mouseenter", onEnter);
        container.addEventListener("mouseleave", onLeave);

        return () => {
            container.removeEventListener("mouseenter", onEnter);
            container.removeEventListener("mouseleave", onLeave);
        };
    }, [containerRef]);

    delayNumber++;

    return (
        <div ref={containerRef} className="relative " {...others}>
            <div
                className="hover:translate-y-[20px]"
                style={{ transition: "translate .1s" }}
            >
                <div className="absolute z-2 top-[50%] left-[50%] -translate-[50%]">
                    {children}
                </div>
                <BsHexagonFill
                    style={{ translate: `${padding / 2}px ${padding / 2}px` }}
                    className="z-1 absolute"
                    color="var(--sidebar)"
                    size={size - padding}
                    opacity={0.95}
                />
                <BsHexagonFill
                    color={color}
                    size={size}
                    className="absolute"
                    style={{ transition: "filter .1s" }}
                    filter={`drop-shadow(0px ${hover ? 0 : 20}px ${color}5f)`}
                />
                <BsHexagonFill
                    color={color}
                    size={size}
                    className="animate-pulse"
                    style={{ animationDelay: `${delayNumber / 3}s` }}
                    filter={`drop-shadow(0px 0px 25px ${color}7f)`}
                />
            </div>
        </div>
    );
}

let delayNumber = 0;

export default function Catan2D() {
    const outerRef = useRef<HTMLDivElement>(null);
    const boardRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    const {
        set,
        materials,
        initialized,
        client: { socket },
        local: { name },
    } = useCatanStore();
    useEffect(() => {
        socket!.on(
            ClientCodes.INIT,
            ({
                harbors,
                materials,
                bank,
                id,
            }: {
                harbors: [number, number][];
                materials: [
                    number,
                    {
                        num: number;
                        material: number;
                    }
                ][];
                bank: {
                    materials: number[];
                    devcards: number[];
                };
                id: number;
            }) => {
                const harborMap = new Map(harbors);

                console.log(JSON.stringify(materials));

                const materialsMap = new Map(
                    materials.map(([index, { num, material }]) => {
                        return [
                            index,
                            {
                                num,
                                material: convertions.matsNaming[material],
                            },
                        ];
                    })
                );

                set({
                    harbors: harborMap,
                    materials: materialsMap,
                    initialized: true,
                    bank: {
                        devcards: bank.devcards as DevcardList,
                        materials: bank.materials as DevcardList,
                    },
                    client: {
                        socket,
                        id,
                    },
                });
            }
        );

        socket!.emit(ServerCodes.INIT, name);
    }, []);

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
                        {rows.flatMap((rowLength, rowIndex) =>
                            new Array(rowLength)
                                .fill(null)
                                .map((_, colIndex) => {
                                    const hexIndex =
                                        (rowIndex === 0
                                            ? 0
                                            : rowIndex === 1
                                            ? rows[0]
                                            : rows
                                                  .slice(0, rowIndex)
                                                  .reduce((a, b) => a + b) ??
                                              0) + colIndex;

                                    const { num, material } =
                                        materials.get(hexIndex)!;
                                    const colorValue =
                                        convertions.matsColors[material];

                                    const x =
                                        fixing.x *
                                        round *
                                        spacing *
                                        (-(rowLength - 3) + colIndex * 2);
                                    const z =
                                        rowIndex *
                                        2 *
                                        round *
                                        fixing.z *
                                        spacing;

                                    return (
                                        <Hex
                                            key={hexIndex}
                                            color={colorValue}
                                            className="absolute cursor-grab"
                                            style={{
                                                translate: `${x}px ${z}px`,
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
                                    );
                                })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
