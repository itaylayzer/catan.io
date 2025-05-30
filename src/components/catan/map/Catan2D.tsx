import React, { Component, createRef } from "react";
import Areas from "@/config/data/ui/areas.json";
import Roads from "@/config/data/ui/roads.json";
import Settlements from "@/config/data/ui/settlements.json";
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
import { UIMapState, useCatanStore } from "@/store/useCatanStore";
import { EventDispatcher } from "@/utils/EventDispatcher";
import { COLORS, STORE_ICONS } from "@/config/constants/ui";
import { MdCircle } from "react-icons/md";
class Catan2D extends Component<
    {},
    {
        materials: Map<
            number,
            {
                num: number;
                material: string;
            }
        >;
        robberArea: number;
        mapState: UIMapState;
        scale: number;
        events: EventDispatcher;
        sets: {
            settlements: Map<number, number>;
            roads: Map<number, number>;
            cities: Set<number>;
        };
    },
    {}
> {
    static _instance: Catan2D | null = null;

    static get instance() {
        return this._instance;
    }

    outerRef = createRef<HTMLDivElement>();
    boardRef = createRef<HTMLDivElement>();

    constructor(props: any) {
        super(props);
        Catan2D._instance = this;
        // Hooking into the Catan Store
        const {
            materials,
            robberArea,
            ui: { mapState, events },
            prepareMapSets,
        } = useCatanStore.getState();

        this.state = {
            ...this.state,
            materials,
            robberArea,
            mapState,
            events,
            scale: 1,
            sets: prepareMapSets(),
        };

        // Listen for store updates
        useCatanStore.subscribe((newState) => {
            this.setState({
                materials: newState.materials,
                robberArea: newState.robberArea,
                mapState: newState.ui.mapState,
                events: newState.ui.events,
                sets: newState.prepareMapSets(),
            });
        });
    }

    componentDidMount() {
        this.updateScale();
        window.addEventListener("resize", this.updateScale);
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.updateScale);
    }

    updateScale = () => {
        const outer = this.outerRef.current?.getBoundingClientRect();
        const board = this.boardRef.current?.getBoundingClientRect();

        if (outer && board) {
            const scaleX = outer.width / board.width;
            const scaleY = outer.height / board.height;

            this.setState({ scale: Math.min(scaleX, scaleY, 1) }); // Prevent upscaling
        }
    };

    render() {
        const { scale, mapState, materials, robberArea, sets } = this.state;
        const { roads, settlements, cities } = sets;

        if (mapState === "loading") return null;
        console.log("mapState", mapState);
        return (
            <div
                className="relative w-full h-full overflow-hidden"
                ref={this.outerRef}
            >
                <div
                    className="absolute"
                    style={{
                        left: "50%",
                        top: "50%",
                        transform: `translate(-50%, -50%) scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                >
                    <div ref={this.boardRef} className="relative w-fit h-fit">
                        <div style={{ translate: `-215px -322.5px` }}>
                            {Array.from(materials.entries()).map(
                                ([index, { num, material }]: any) => {
                                    const className =
                                        mapState === "picking area" &&
                                        robberArea !== index
                                            ? `animate-pulse opacity-30 hover:opacity-75 hover:animate-none hover:scale-90 scale-95 transition-[transform,opacity] cursor-pointer z-10`
                                            : `pointer-events-none`;

                                    return (
                                        <Hex
                                            onClick={() =>
                                                console.log(
                                                    "picked area:",
                                                    index
                                                )
                                            }
                                            key={index}
                                            color={
                                                convertions.matsColors[material]
                                            }
                                            className={cn(
                                                "absolute",
                                                className
                                            )}
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
                                                        {matsToIcon[material]?.(
                                                            {
                                                                fill: "white",
                                                                stroke: "white",
                                                                color: "white",
                                                                width: 30,
                                                                height: 30,
                                                            }
                                                        )}
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

                            {Settlements.map(({ x, y }: any, index: number) => {
                                const used =
                                    settlements.has(index) &&
                                    !cities.has(index);

                                const baseColor = used
                                    ? COLORS[settlements.get(index)!]
                                    : "#ffffff";

                                const opacity =
                                    used &&
                                    mapState !== "picking vertex upgrade"
                                        ? "ff"
                                        : mapState === "picking vertex"
                                        ? "88"
                                        : "00";

                                const color = `${baseColor}${opacity}`;
                                const className =
                                    mapState === "picking vertex" && !used
                                        ? "animate-pulse hover:scale-95 hover:animate-none cursor-pointer"
                                        : "pointer-events-none";

                                return (
                                    <div
                                        key={index}
                                        data-id={index}
                                        className={cn(
                                            "z-2 absolute transition-transform",
                                            className
                                        )}
                                        style={{
                                            translate: `${x}px ${y}px`,
                                        }}
                                        onClick={() => {
                                            console.log(
                                                "picked vertex:",
                                                index
                                            );
                                            this.state.events.emit(
                                                "picked vertex",
                                                index
                                            );
                                        }}
                                    >
                                        <MdCircle
                                            color={color}
                                            className="absolute top-0 left-0"
                                            size={30}
                                            style={{
                                                translate: `${-15}px ${-15}px`,
                                            }}
                                        />
                                        {STORE_ICONS.settlement({
                                            size: 15,
                                            color: `#000000${opacity}`,
                                            style: {
                                                translate: `${-15 + 7.5}px ${
                                                    -15 + 7.5
                                                }px`,
                                            },
                                            className: "absolute top-0 left-0",
                                        })}
                                    </div>
                                );
                            })}

                            {Settlements.map(({ x, y }: any, index: number) => {
                                const used = cities.has(index);
                                const opacity = used
                                    ? "ff"
                                    : mapState === "picking vertex upgrade" &&
                                      settlements.has(index)
                                    ? "88"
                                    : "00";
                                const baseColor = used
                                    ? COLORS[settlements.get(index)!]
                                    : "#ffffff";
                                const color = `${baseColor}${opacity}`;
                                const className =
                                    mapState === "picking vertex upgrade" &&
                                    !used
                                        ? "animate-pulse hover:scale-95 hover:animate-none cursor-pointer"
                                        : "pointer-events-none";

                                return (
                                    <div
                                        key={index}
                                        data-id={index}
                                        className={cn(
                                            "z-2 absolute transition-transform",
                                            className
                                        )}
                                        style={{
                                            translate: `${x}px ${y}px`,
                                        }}
                                        onClick={() => {
                                            console.log(
                                                "picked vertex upgrade:",
                                                index
                                            );
                                            this.state.events.emit(
                                                "picked vertex upgrade",
                                                index
                                            );
                                        }}
                                    >
                                        <MdCircle
                                            color={color}
                                            className="absolute top-0 left-0"
                                            size={30}
                                            style={{
                                                translate: `${-15}px ${-15}px`,
                                            }}
                                        />
                                        {STORE_ICONS.city({
                                            size: 15,
                                            color: `#000000${opacity}`,
                                            style: {
                                                translate: `${-15 + 7.5}px ${
                                                    -15 + 7.5
                                                }px`,
                                            },
                                            className: "absolute top-0 left-0",
                                        })}
                                        <div />
                                    </div>
                                );
                            })}

                            <svg className="absolute -top-[50px] -left-[400px] w-[1000px] h-[1000px]">
                                {Roads.map(({ from, to }, index: number) => {
                                    const hash = from.index * 1000 + to.index;

                                    const used = roads.has(hash);
                                    let color = used
                                        ? COLORS[roads.get(hash)!]
                                        : "#ffffff";

                                    const stroke = `${color}${
                                        used
                                            ? "ff"
                                            : mapState === "picking edge"
                                            ? "55"
                                            : "00"
                                    }`;
                                    const className =
                                        mapState === "picking edge" && !used
                                            ? "animate-pulse hover:animate-none cursor-pointer"
                                            : "pointer-events-none";

                                    return (
                                        <line
                                            key={index}
                                            stroke={stroke}
                                            className={className}
                                            strokeWidth={5}
                                            x1={to.x + 400}
                                            x2={from.x + 400}
                                            y1={to.y + 50}
                                            y2={from.y + 50}
                                            onClick={() => {
                                                console.log(
                                                    "picked edge:",
                                                    index
                                                );
                                                this.state.events.emit(
                                                    "picked edge",
                                                    from.index,
                                                    to.index
                                                );
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
}

export default Catan2D;
