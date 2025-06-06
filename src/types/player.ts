import { DevcardList, MaterialList } from "./materials";

export interface Player {
    name: string;
    victoryPoints: number;
    devcards: number;
    materials: number;
    color: number;
    settlements: number[];
    cities: number[];
    roads: [number, number][];
    maxRoad: number;
    knightUsed: number;
    ready: boolean;
}

export type LocalPlayer = Omit<Player, "materials" | "devcards"> & {
    materials: MaterialList;
    devcards: DevcardList;
    amounts: Record<"road" | "settlement" | "city", number>;
};
