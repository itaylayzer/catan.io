import React, { Component, createRef } from "react";
import Areas from "@/config/data/ui/areas.json";
import Harbors from "@/config/data/ui/harbors.json";
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
import {
    COLORS,
    HARBOR_ICONS,
    MATERIALS,
    STORE_ICONS,
} from "@/config/constants/ui";
import { MdCircle } from "react-icons/md";
import { FaShip } from "react-icons/fa6";
import SpinnerCircleDemo from "@/components/customized/spinner/spinner-02";

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
        allowed: Set<number>;
        harbors: number[];
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
            harbors,
            allowedPicks,
        } = useCatanStore.getState();

        this.state = {
            ...this.state,
            materials,
            robberArea,
            mapState,
            events,
            scale: 1,
            sets: prepareMapSets(),
            allowed: allowedPicks(),
            harbors,
        };

        // Listen for store updates
        useCatanStore.subscribe((newState) => {
            this.setState({
                materials: newState.materials,
                robberArea: newState.robberArea,
                mapState: newState.ui.mapState,
                events: newState.ui.events,
                sets: newState.prepareMapSets(),
                harbors: newState.harbors,
                allowed: newState.allowedPicks(),
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
        const {
            scale,
            mapState,
            materials,
            robberArea,
            sets,
            harbors,
            allowed,
        } = this.state;
        const { roads, settlements, cities } = sets;

        if (mapState === "loading" || harbors.length === 0)
            return (
                <div className="h-100 flex justify-center items-center">
                    <SpinnerCircleDemo />
                </div>
            );
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
                                            onClick={() => {
                                                console.log(
                                                    "picked area:",
                                                    index
                                                );
                                                this.state.events.emit(
                                                    "picked area",
                                                    index
                                                );
                                            }}
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
                                const allow = allowed.has(index);
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
                                        : mapState === "picking vertex" && allow
                                        ? "88"
                                        : "00";

                                const color = `${baseColor}${opacity}`;
                                const className =
                                    mapState === "picking vertex" &&
                                    !used &&
                                    allow
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

                            {Harbors.map(({ x, y }: any, index: number) => {
                                const materialIndex = harbors[index];

                                const { icon, name } =
                                    HARBOR_ICONS[materialIndex];
                                const color =
                                    materialIndex < 5
                                        ? convertions.matsColors[
                                              name.toLocaleLowerCase()
                                          ] + "ff"
                                        : "#ffff";

                                return (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div
                                                key={index}
                                                data-id={index}
                                                className={cn(
                                                    "z-2 absolute opacity-50 hover:opacity-100 hover:scale-110 w-[33px] h-[33px] transition-[opacity,scale]"
                                                )}
                                                style={{
                                                    translate: `${x - 16.5}px ${
                                                        y - 16.5
                                                    }px`,
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
                                                    color={"#666"}
                                                    className="absolute top-0 left-0 "
                                                    size={33}
                                                    // style={{
                                                    // translate: `${-16.5}px ${-16.5}px`,
                                                    // }}
                                                />
                                                <MdCircle
                                                    color={"var(--background)"}
                                                    className="absolute top-0 left-0"
                                                    size={30}
                                                    style={{
                                                        translate: `${1.5}px ${1.5}px`,
                                                    }}
                                                />
                                                {icon({
                                                    color: color,
                                                    style: {
                                                        translate: `${
                                                            1.5 + 7.5
                                                        }px ${1.5 + 7.5}px`,
                                                        stroke: color,
                                                        opacity: 1,
                                                        fill: color,
                                                        width: 15,
                                                        height: 15,
                                                    },
                                                    className:
                                                        "absolute top-0 left-0",
                                                })}
                                                <div />
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <div className="flex justify-center gap-2 items-center">
                                                {icon({
                                                    color: color,
                                                    width: "15",
                                                    height: "15",
                                                    stroke: color,
                                                    fill: color,
                                                    style: {
                                                        translate: "0px -2px",
                                                    },
                                                })}
                                                <h1 className="text-mid text-center font-[Rubik]">
                                                    {name} Deal
                                                </h1>
                                            </div>
                                            <p className="text-sm opacity-50 font-[Geist]">
                                                {materialIndex < 5
                                                    ? `Give 2 ${name} For 1 Material`
                                                    : `Give 3 of the Same Material For 1 Material`}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}

                            <svg className="absolute -top-[50px] -left-[400px] w-[1000px] h-[1000px]">
                                {Roads.map(({ from, to }, index: number) => {
                                    const hash = from.index * 1000 + to.index;

                                    const allow = allowed.has(hash);

                                    const used = roads.has(hash);
                                    let color = used
                                        ? COLORS[roads.get(hash)!]
                                        : "#ffffff";

                                    const insidePickingState = [
                                        "picking edge",
                                        "picking 2 edges",
                                    ].includes(mapState);

                                    const stroke = `${color}${
                                        used
                                            ? "ff"
                                            : insidePickingState && allow
                                            ? "55"
                                            : "00"
                                    }`;
                                    const className =
                                        insidePickingState && !used && allow
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

                                {Harbors.flatMap(
                                    ({ x, y, settlements }, index: number) => {
                                        const color = "#666";
                                        return settlements.flatMap((index) => {
                                            const vertex = Settlements[index];

                                            const strokeWidth = 1;
                                            const p = (
                                                k: number,
                                                l: number
                                            ) => {
                                                return {
                                                    x:
                                                        (l * x + k * vertex.x) /
                                                        (k + l),
                                                    y:
                                                        (l * y + k * vertex.y) /
                                                        (k + l),
                                                };
                                            };

                                            const from = p(7, 10);
                                            const to = p(10, 7);
                                            const circleLineStrokeM = 0.7;

                                            return [
                                                <line
                                                    className="animate-pulse"
                                                    key={index}
                                                    stroke={color}
                                                    strokeWidth={strokeWidth}
                                                    x1={from.x + 400}
                                                    x2={to.x + 400}
                                                    y1={from.y + 50}
                                                    y2={to.y + 50}
                                                />,
                                                // <circle
                                                //     cx={from.x + 400}
                                                //     cy={from.y + 50}
                                                //     r={
                                                //         strokeWidth /
                                                //         circleLineStrokeM
                                                //     }
                                                //     fill={color}
                                                //     stroke={color}
                                                //     color={color}
                                                // />,
                                                <circle
                                                    className="animate-pulse"
                                                    cx={to.x + 400}
                                                    cy={to.y + 50}
                                                    r={
                                                        strokeWidth /
                                                        circleLineStrokeM
                                                    }
                                                    fill={color}
                                                    stroke={color}
                                                    color={color}
                                                />,
                                            ];
                                        });
                                    }
                                )}
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Catan2D;
