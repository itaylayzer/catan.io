import { handleSocket } from "@/client/client";
import { Socket } from "@/server/sockets";
import { DevcardList, MaterialList } from "@/types/materials";
import { Player } from "@/types/player";
import { EventDispatcher } from "@/utils/EventDispatcher";
import { create } from "zustand";
import MaterialsStarter from "@/config/data/starter/materials.json";
import DevcardsStarter from "@/config/data/starter/devcards.json";

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
    harbors: Map<number, number>;
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
    local: Omit<Player, "materials" | "devcards"> & {
        materials: MaterialList;
        devcards: DevcardList;
        amounts: Record<"road" | "settlement" | "city", number>;
    };
    turnId: number;
    dices: undefined | [number, number];
    ui: {
        mapState: UIMapState;
        dicesState: UITurnState;
        events: EventDispatcher;
    };
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
};

const defaultValue: CatanData = {
    longestRoad: -1,
    largestArmy: -1,
    robberArea: -1,
    harbors: new Map(),
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
        materials: MaterialsStarter as MaterialList,
        devcards: DevcardsStarter as MaterialList,
        roads: [],
        cities: [],
        settlements: [],
        victoryPoints: 0,
        color: 0,
        name: "shani",
        amounts: {
            city: 4,
            road: 15,
            settlement: 5,
        },
        maxRoad: 0,
    },
    turnId: 0,
    dices: undefined,
    ui: {
        mapState: "picking area",
        dicesState: "ready",
        events: new EventDispatcher(),
    },
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
}));
