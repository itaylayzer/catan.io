import { MaterialList, DevcardList } from "@/types/materials";
import { Socket } from "./sockets";

import MaterialsStarter from "@/config/data/starter/materials.json";
import DevcardsStarter from "@/config/data/starter/devcards.json";
import { Catan } from "./CatanGraph";

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
    public twoRoadsState: boolean;
    public sevenNeedToGive: boolean;

    constructor(
        public id: number,
        public name: string,
        public socket: Socket,
        private game: Catan
    ) {
        this.victory = 0;
        this.materials = [...MaterialsStarter] as MaterialList;
        this.devcards = [...DevcardsStarter] as DevcardList;

        this.settlements = new Set();
        this.roads = new Set();
        this.cities = new Set();

        this.sevenNeedToGive = false;

        this.amounts = {
            city: 4,
            road: 15,
            settlement: 5,
        };
        this.knightUsed = 0;
        this.maxRoad = 0;
        this.twoRoadsState = false;
    }

    public get victoryPoints() {
        const achivements = this.game.json_achivements();

        const ownLargestArmy = achivements.largestArmy === this.id;
        const ownLongestRoad = achivements.longestRoad === this.id;

        return (
            this.settlements.size +
            this.cities.size +
            (+ownLargestArmy + +ownLongestRoad) * 2
        );
    }

    public get realVictoryPoints() {
        return this.victoryPoints + this.devcards[1];
    }
}
