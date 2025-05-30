import { MaterialList, DevcardList } from "@/types/materials";
import { Socket } from "./sockets";

import MaterialsStarter from "@/config/data/starter/materials.json";
import DevcardsStarter from "@/config/data/starter/devcards.json";

export class Player {
    public victory: number;
    public materials: MaterialList;
    public devcards: DevcardList;
    public settlements: Set<number>;
    public cities: Set<number>;
    public roads: Set<[number, number]>;
    public knightUsed: number;
    public maxRoad: number;
    public amounts: Record<"road" | "settlement" | "city", number>;

    constructor(public id: number, public name: string, public socket: Socket) {
        this.victory = 0;
        this.materials = MaterialsStarter as MaterialList;
        this.devcards = DevcardsStarter as DevcardList;

        this.settlements = new Set();
        this.roads = new Set();
        this.cities = new Set();

        this.amounts = {
            city: 4,
            road: 15,
            settlement: 5,
        };
        this.knightUsed = 0;
        this.maxRoad = 0;
    }

    public get victoryPoints() {
        console.log(
            "server",
            "victory point",
            this.settlements.size,
            this.cities.size,
            this.devcards[1]
        );
        return this.settlements.size + this.cities.size + this.devcards[1];
    }
}
