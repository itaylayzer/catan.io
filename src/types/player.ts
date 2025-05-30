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
}
