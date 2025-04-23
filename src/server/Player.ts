import { MaterialList, DevcardList } from "@/types/materials";
import { Socket } from "./sockets";

export class Player {
    public victory: number;
    public materials: MaterialList;
    public devcards: DevcardList;
    public settlements: Set<number>;
    public cities: Set<number>;
    public roads: Set<[number, number]>;
    public knightUsed: number;
    public amounts: Record<"road" | "settlement" | "city", number>;

    constructor(public id: number, public name: string, public socket: Socket) {
        this.victory = 0;
        this.materials = [0, 0, 0, 0, 0];
        this.devcards = [0, 0, 0, 0, 0];

        this.settlements = new Set([0]);
        this.roads = new Set();
        this.cities = new Set();

        this.amounts = {
            city: 4,
            road: 15,
            settlement: 5,
        };
        this.knightUsed = 0;
    }

    public increaseVictory() {
        this.victory++;
    }

    public get victoryPoints() {
        return this.victory + this.devcards[1];
    }
}
