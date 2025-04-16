import { AREAS, MAX_PLAYERS, VERTECIES } from "@/config/constants/game";
import { Material } from "@/types/materials";
import { VertexType } from "@/types/vertex";
import { ArrayShuffle } from "@/utils/ArrayShuffle";
import { GraphUtils, Vertex } from "./Graph";
import AreasArray from "@/config/data/areas.json";
import SettlementsArray from "@/config/data/areas.json";
import HarborsArray from "@/config/data/harbors.json";
import { Player } from "./Player";
import { Socket } from "./sockets";

const MIDDLE_INDEX = 9;

export class Catan {
    private vertecies: Vertex[];
    private players: Player[];
    private bank: { materials: number[]; devcards: number[] };
    constructor() {
        this.vertecies = Array(AREAS + VERTECIES)
            .fill(undefined)
            .map((_, index) => {
                return {
                    color:
                        index < AREAS ? VertexType.AREA : VertexType.SETTLEMENT,
                    edges: new Map(),
                };
            });

        this.bank = {
            devcards: [14, 5, 2, 2, 2],
            materials: [19, 19, 19, 19, 19],
        };
        this.players = [];

        this.prepareCatanEdges();
        this.prepareCatanLands();
        this.prepareCatanHarbors();
    }

    ////////////////////// PREPARE ///////////////////
    private prepareCatanEdges() {
        const arr = [
            [AreasArray, VertexType.AREA],
            [SettlementsArray, VertexType.SETTLEMENT],
        ] as [
            Record<"from" | "to", number>[],
            VertexType.AREA | VertexType.SETTLEMENT
        ][];

        for (const [vertecies, color] of arr) {
            for (const { from, to } of vertecies) {
                GraphUtils.join(this.vertecies, from, to, color);
            }
        }
    }

    private prepareCatanLands() {
        const materials = [
            Material.WOOD,
            Material.WOOD,
            Material.WOOD,
            Material.WOOD,
            Material.WOOL,
            Material.WOOL,
            Material.WOOL,
            Material.WOOL,
            Material.WHEAT,
            Material.WHEAT,
            Material.WHEAT,
            Material.WHEAT,
            Material.BRICK,
            Material.BRICK,
            Material.BRICK,
            Material.ORE,
            Material.ORE,
            Material.ORE,
        ];
        const numbers = [
            2, 3, 3, 4, 4, 5, 5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12,
        ];

        ArrayShuffle(materials);
        ArrayShuffle(numbers);

        for (let offset = 0; offset < AREAS - 1; offset++) {
            const middleOrAfter = offset >= MIDDLE_INDEX;

            this.vertecies[offset + +middleOrAfter].material = {
                material: materials.shift()!,
                num: numbers.shift()!,
            };
        }

        this.vertecies[MIDDLE_INDEX].material = {
            material: 5,
            num: 7,
        };
    }

    private prepareCatanHarbors() {
        const mats = [
            Material.WOOD,
            Material.WOOL,
            Material.WHEAT,
            Material.BRICK,
            Material.ORE,
            Material.GENERAL_DEAL,
            Material.GENERAL_DEAL,
            Material.GENERAL_DEAL,
            Material.GENERAL_DEAL,
        ];

        ArrayShuffle(mats);

        for (let offset = 0; offset < mats.length; offset++) {
            this.vertecies[HarborsArray[offset * 2] + AREAS].harbor =
                this.vertecies[HarborsArray[offset * 2 + 1] + AREAS].harbor =
                    mats[offset];
        }
    }
    /////////////////// PLAYER /////////////////
    public get playerCount() {
        return this.players.length;
    }

    public playerJoin(name: string, socket: Socket) {
        return (
            this.players.push(new Player(this.playerCount, name, socket)) - 1
        );
    }

    /////////////////// EXPORT /////////////////
    public json() {
        return {
            harbors: this.vertecies
                .filter((v) => v.harbor !== undefined)
                .map((v, i) => [i - AREAS, v.harbor!]),
            materials: this.vertecies
                .filter((v) => v.material !== undefined)
                .map(
                    (v, i) =>
                        [i, v.material!] as [
                            number,
                            { num: number; material: number }
                        ]
                ),
            bank: this.bank,
        };
    }

    /////////////////// SERVER ACTIONS //////////////////////
    public playersAroundArea(vertex: number) {
        const players = Array(this.players.length).fill(false);

        this.vertecies[vertex].edges.forEach(({ vertex: target }) => {
            if (target.color < MAX_PLAYERS) {
                players[+target.color] = true;
            }
        });

        return players;
    }

    public inf_playerActionable(playerId: number) {
        // TODO:
    }

    public inf_playerMaterials(playerId: number) {
        return this.players.map((p) => {
            if (p.id === playerId) {
                return p.materials;
            }

            return p.materials.reduce((a, b) => a + b);
        });
    }

    public inf_playerDevcards(playerId: number) {
        return this.players.map((p) => {
            if (p.id === playerId) {
                return p.devcards;
            }

            return p.devcards.reduce((a, b) => a + b);
        });
    }

    public inf_playerVictoryPoints() {
        return this.players.map((p) => p.victoryPoints);
    }

    public inf_playerAmounts(playerId: number) {
        return this.players[playerId].amounts;
    }

    public inf_achivementCards(playerId: number) {
        // TODO:
    }

    public act_rollDice(playerId: number) {
        // TODO:
    }

    public act_moveRobber(playerId: number) {
        // TODO:
    }

    public act_devCard(playerId: number) {
        // TODO:
    }
    public act_dropMaterials(playerId: number) {
        // TODO:
    }
}
