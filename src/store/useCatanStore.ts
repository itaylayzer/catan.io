import { handleSocket } from "@/client/client";
import { Socket } from "@/server/sockets";
import { DevcardList, MaterialList } from "@/types/materials";
import { LocalPlayer, Player } from "@/types/player";
import { EventDispatcher } from "@/utils/EventDispatcher";
import { create } from "zustand";
import MaterialsStarter from "@/config/data/starter/materials.json";
import DevcardsStarter from "@/config/data/starter/devcards.json";
import Settlements from "@/config/data/game/settlements.json";
import { AREAS, VERTECIES } from "@/config/constants/game";
import { Trade } from "@/types/trade";

export type UIMapState =
    | "loading"
    | "ready"
    | "picking vertex"
    | "picking area"
    | "picking edge"
    | "picking vertex upgrade"
    | "picking 2 edges";

export type UITurnState = "ready" | "rolling" | "mine" | "others";

type CatanData = {
    largestArmy: number;
    longestRoad: number;
    harbors: number[];
    materials: Map<
        number,
        {
            num: number;
            material: string;
        }
    >;
    robberArea: number;
    bank: {
        materials: MaterialList;
        devcards: DevcardList;
    };
    client: {
        id?: number;
        socket?: Socket;
    };
    onlines: Map<number, Player>;
    local: LocalPlayer;
    turnId: number;
    dices: undefined | [number, number];
    ui: {
        gameStarted: boolean;
        mapState: UIMapState;
        dicesState: UITurnState;
        events: EventDispatcher;
    };
    secondSettlement?: number | undefined;
    firstRounds: boolean;
    trades: Map<number, Trade>;
};

type CatanActions = {
    set: {
        (
            partial:
                | CatanStore
                | Partial<CatanStore>
                | ((state: CatanStore) => CatanStore | Partial<CatanStore>),
            replace?: false
        ): void;
        (
            state: CatanStore | ((state: CatanStore) => CatanStore),
            replace: true
        ): void;
    };
    setSocket: (socket: Socket) => void;
    prepareMapSets: () => Record<
        "settlements" | "roads",
        Map<number, number>
    > & { cities: Set<number> };
    allowedPicks: () => Set<number>;
    resetToDefaults: () => void;
};

const defaultValue: CatanData = {
    trades: new Map(),
    longestRoad: -1,
    largestArmy: -1,
    robberArea: -1,
    harbors: [],
    materials: new Map(),
    bank: {
        devcards: [0, 0, 0, 0, 0],
        materials: [0, 0, 0, 0, 0],
    },
    client: {
        id: -1,
    },
    onlines: new Map(),
    local: {
        knightUsed: 0,
        materials: [...MaterialsStarter] as MaterialList,
        devcards: [...DevcardsStarter] as MaterialList,
        roads: [],
        cities: [],
        settlements: [],
        victoryPoints: 0,
        color: 0,
        name: "",
        amounts: {
            city: 4,
            road: 15,
            settlement: 5,
        },
        maxRoad: 0,
        ready: false,
    },
    turnId: 0,
    dices: undefined,
    ui: {
        gameStarted: false,
        mapState: "picking area",
        dicesState: "ready",
        events: new EventDispatcher(),
    },
    firstRounds: true,
};

export type CatanStore = CatanData & CatanActions;

export const useCatanStore = create<CatanStore>((set, get) => ({
    ...defaultValue,
    set,
    setSocket(socket) {
        handleSocket(socket, set, get);
    },
    prepareMapSets() {
        const { local, onlines } = get();

        const roads = new Map<number, number>();
        const settlements = new Map<number, number>();
        const cities = new Set<number>();

        [...Array.from(onlines.values()), local].flat().forEach((xplayer) => {
            xplayer.roads.forEach((road, index) => {
                roads.set(road[0] * 1000 + road[1], xplayer.color);
            });

            xplayer.settlements.forEach((settlement) => {
                settlements.set(settlement, xplayer.color);
            });

            xplayer.cities.forEach((city) => {
                cities.add(city);
            });
        });

        return { roads, settlements, cities };
    },
    resetToDefaults() {
        set((old) => ({
            ...defaultValue,
            onlines: new Map(),
            materials: new Map(),
            bank: {
                devcards: [0, 0, 0, 0, 0],
                materials: [0, 0, 0, 0, 0],
            },
            local: {
                ...defaultValue.local,
                name: old.local.name,
            },
        }));
    },
    allowedPicks() {
        const {
            secondSettlement,
            ui: { mapState },
            local,
            firstRounds,
            prepareMapSets,
        } = get();

        const { roads, settlements } = prepareMapSets();

        const allowed = new Set<number>();

        const hashRoad = (from: number, to: number) => {
            const min = Math.min(from, to);
            const max = Math.max(from, to);

            return min * 1000 + max;
        };

        const addRoad = (from: number, to: number) => {
            allowed.add(hashRoad(from, to));
        };

        const deleteNearbyRoads = () => {
            // Delete nearby roads connection to online settlements for 2 spaces rule
            settlements.forEach((color, settlementIndex) => {
                if (color !== local.color) {
                    const settlementId = settlementIndex + AREAS;

                    allowed.forEach((road) => {
                        const to = road % 1000;
                        const from = Math.floor(road / 1000);

                        if (settlementId === to || settlementId === from) {
                            allowed.delete(road);
                        }
                    });
                }
            });

            roads.forEach((color, onlineRoad) => {
                if (color !== local.color) {
                    allowed.forEach((road) => {
                        const to = road % 1000;
                        const from = Math.floor(road / 1000);

                        const onlineTo = onlineRoad % 100;
                        const onlineFrom = Math.floor(onlineRoad / 1000);

                        if (
                            onlineTo === to ||
                            onlineFrom === from ||
                            onlineTo === from ||
                            onlineFrom === to
                        ) {
                            allowed.delete(road);
                        }
                    });
                }
            });
        };

        if (secondSettlement) {
            const connections = Settlements.filter(
                ({ from }) => from === secondSettlement + AREAS
            );

            connections.forEach(({ from, to }) => addRoad(from, to));

            deleteNearbyRoads();

            return allowed;
        }

        if (firstRounds && mapState.includes("vertex")) {
            console.log("picks:", "first rounds and vertex");

            // Add all settlements
            for (let index = 0; index < VERTECIES; index++) {
                allowed.add(index);
            }

            settlements.forEach((_, key) => {
                const hash = key + AREAS;

                // Delete current settlement cause its bought
                allowed.delete(key);

                // Delete nearby settlements for 2 spaces rule
                Settlements.filter(({ from }) => from === hash).forEach(
                    ({ to }) => {
                        allowed.delete(to - AREAS);
                    }
                );
            });

            return allowed;
        }

        if (mapState.includes("edge") && firstRounds) {
            const connections = Settlements.filter(
                ({ from }) => from === local.settlements[0] + AREAS
            );

            connections.forEach(({ from, to }) => addRoad(from, to));

            deleteNearbyRoads();

            return allowed;
        }

        if (mapState.includes("edge")) {
            for (const { from, to } of Settlements.filter(({ from }) =>
                local.roads.some((road) => road.includes(from))
            )) {
                addRoad(from, to);
            }
            for (const { from, to } of Settlements.filter(({ to }) =>
                local.roads.some((road) => road.includes(to))
            )) {
                addRoad(from, to);
            }

            // Delete already bought roads
            roads.forEach((roadHash) => {
                allowed.has(roadHash) && allowed.delete(roadHash);
            });

            deleteNearbyRoads();

            return allowed;
        }

        if (mapState.includes("vertex")) {
            // Add all settlements
            for (let index = 0; index < VERTECIES; index++) {
                allowed.add(index);
            }

            settlements.forEach((_, key) => {
                const hash = key + AREAS;

                // Delete current settlement cause its bought
                allowed.delete(key);

                // Delete nearby settlements for 2 spaces rule
                Settlements.filter(({ from }) => from === hash).forEach(
                    ({ to }) => {
                        allowed.delete(to - AREAS);
                    }
                );
            });

            // Only leave those that have local roads connections
            const connectedRoads = Array.from(allowed.values()).filter(
                (settlementIndex) => {
                    const settlementId = settlementIndex + AREAS;

                    return local.roads.some((road) =>
                        road.includes(settlementId)
                    );
                }
            );

            return new Set(connectedRoads);
        }

        return allowed;
    },
}));
