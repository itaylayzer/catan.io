import { MaterialList, DevcardList } from "@/types/materials";
import { RandomIndex } from "@/utils/RandomIndex";

export class Bank {
    private materials: MaterialList = [25, 25, 25, 25, 25];
    private devcards: DevcardList = [25, 25, 25, 25, 25];

    constructor() {}

    private randomCard(list: number[]) {
        if (list.filter((value) => value === 0).length === list.length)
            return -1;

        let randomIndex = RandomIndex(list);

        while (list[randomIndex] <= 0) {
            randomIndex = RandomIndex(list);
        }

        // Decrease
        list[randomIndex] -= 1;

        return randomIndex;
    }

    private retrive(origin: number[], cards: number[]) {
        for (const [index, value] of cards.entries()) {
            origin[index] += value;
        }
    }

    public randomDevcard() {
        return this.randomCard(this.devcards);
    }

    public randomMaterial() {
        return this.randomCard(this.materials);
    }

    public retriveDevcards(cards: number[]) {
        this.retrive(this.devcards, cards);
    }

    public retriveMaterials(cards: number[]) {
        this.retrive(this.materials, cards);
    }
}
