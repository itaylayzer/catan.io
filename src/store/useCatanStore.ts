import { Socket } from "@/server/sockets";
import { MaterialList, DevcardList } from "@/types/materials";
import { Player } from "@/types/player";
import { create } from "zustand";

type CatanData = {
    initialized: boolean;
    harbors: Map<number, number>;
    materials: Map<
        number,
        {
            num: number;
            material: string;
        }
    >;
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
};

const defaultValue: CatanData = {
    initialized: false,
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
        materials: [0, 0, 0, 0, 0],
        devcards: [0, 0, 0, 0, 0],
        roads: 0,
        victoryPoints: 0,
        color: 0,
        name: "shani",
    },
};

export type CatanStore = CatanData & CatanActions;

export const useCatanStore = create<CatanStore>((set) => ({
    ...defaultValue,
    set,
}));
