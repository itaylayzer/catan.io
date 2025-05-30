import { AREAS, MAX_PLAYERS, VERTECIES } from "@/config/constants/game";
import { Material, MaterialList } from "@/types/materials";
import { VertexType } from "@/types/vertex";
import { ArrayShuffle } from "@/utils/ArrayShuffle";
import { GraphUtils, Vertex } from "./Graph";
import AreasArray from "@/config/data/game/areas.json";
import SettlementsArray from "@/config/data/game/settlements.json";
import HarborsArray from "@/config/data/game/harbors.json";
import { Player } from "./Player";
import { Socket } from "./sockets";
import { randInt } from "three/src/math/MathUtils.js";
import VMath from "@/utils/VMath";
import Store from "@/config/data/game/store.json";
import { randIndexBasedValues } from "@/utils/randIndexBasedValues";
const MIDDLE_INDEX = 9;

export class Catan {
    private vertecies: Vertex[];
    private players: Player[];
    private robberArea: number;
    public bank: { materials: number[]; devcards: number[] };
    private turnId: number;

    // Achivements variables
    private longestRoadColor = -1;
    private largestArmyColor = -1;

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
        this.turnId = 0;
        this.robberArea = MIDDLE_INDEX;
        this.players = [];

        this.prepareCatanEdges();
        this.prepareCatanLands();
        this.prepareCatanHarbors();
    }

    public get sockets() {
        return {
            emit: (eventName: string, args?: any) => {
                this.players.forEach(({ socket }) =>
                    socket.emit(eventName, args)
                );
            },
            emitExcept: (exceptId: number, eventName: string, args?: any) => {
                this.players.forEach(
                    ({ socket, id }) =>
                        id !== exceptId && socket.emit(eventName, args)
                );
            },
        };
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

    public playerJoin(name: string, socket: Socket): Player {
        const player = new Player(this.playerCount, name, socket);
        this.players.push(player);

        return player;
    }

    /////////////////// EXPORT /////////////////
    public json() {
        const { robberArea, bank } = this;
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
            robberArea,
            bank,
        };
    }

    public json_achivements() {
        const { longestRoadColor: longestRoad, largestArmyColor: largestArmy } =
            this;

        return { longestRoad, largestArmy };
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

    public act_rollDice() {
        const dices = [3 /* randInt(1, 6) */, 4 /* randInt(1, 6) */];
        const dicesSum = dices[0] + dices[1];

        const areas = this.vertecies
            .filter(({ material }, index) => {
                return (
                    index < AREAS &&
                    material?.num === dicesSum &&
                    this.robberArea !== index
                );
            })
            .flatMap(({ material, edges }) => {
                const { material: mat } = material!;

                const vertecies: { vertex: number; mat: number }[] = [];

                edges.forEach(({ color, offset }) => {
                    if (color === VertexType.SETTLEMENT) {
                        vertecies.push({
                            vertex: offset,
                            mat,
                        });
                    }
                });

                return vertecies;
            });

        const addons =
            dicesSum == 7
                ? []
                : this.players.map(({ id, settlements }) => {
                      const mats = [0, 0, 0, 0, 0];

                      const materials: number[] = [];

                      areas.forEach(({ mat, vertex }) => {
                          settlements.has(vertex - AREAS) &&
                              materials.push(mat);
                      });

                      VMath(mats).countpicks(materials);

                      return { from: id, mats };
                  });
        return {
            dices,
            addons,
        };
    }

    public act_stopTurn(): number {
        return (this.turnId = (this.turnId + 1) % this.players.length);
    }

    public act_buyRoad(
        player: Player,
        roadFrom: number,
        roadTo: number
    ): boolean {
        // check if settlement already bought
        if (
            player.roads.has([roadFrom, roadTo]) ||
            this.vertecies[roadFrom]?.edges.get(roadTo)?.color !==
                VertexType.SETTLEMENT
        )
            return false;

        // check if theres enough amounts
        if (player.amounts.road <= 0) return false;

        // check if theres enough materials
        if (!VMath(player.materials).available(Store.road)) return false;

        // Move mats
        VMath(this.bank.materials).sameSize.add(Store.road);
        VMath(player.materials).sameSize.sub(Store.road);

        const paint = (from: number, to: number, color: number) => {
            this.vertecies[from].edges.get(to)!.color = color;
        };

        // Paint
        paint(roadFrom, roadTo, player.id);
        paint(roadTo, roadFrom, player.id);

        // Add to map
        player.roads.add([roadFrom, roadTo]);

        return true;
    }

    public act_buySettlement(player: Player, settlementIndex: number): boolean {
        // check if settlement already bought
        if (
            player.settlements.has(settlementIndex) ||
            this.vertecies[settlementIndex + AREAS].color !==
                VertexType.SETTLEMENT
        )
            return false;

        // check if theres enough amounts
        if (player.amounts.settlement <= 0) return false;

        // check if theres enough materials
        if (!VMath(player.materials).available(Store.settlement)) return false;

        // Move mats
        VMath(this.bank.materials).sameSize.add(Store.settlement);
        VMath(player.materials).sameSize.sub(Store.settlement);

        // Paint
        this.vertecies[settlementIndex + AREAS].color = player.id;

        // Add to map
        player.settlements.add(settlementIndex);

        return true;
    }

    public act_buyCity(player: Player, cityIndex: number): boolean {
        // check if theres a settlement there or theres already a city there
        if (!player.settlements.has(cityIndex) || player.cities.has(cityIndex))
            return false;

        // check if theres enough amounts
        if (player.amounts.city <= 0) return false;

        // check if theres enough materials
        if (!VMath(player.materials).available(Store.city)) return false;

        // Move mats
        VMath(this.bank.materials).sameSize.add(Store.city);
        VMath(player.materials).sameSize.sub(Store.city);

        // Add to map
        player.cities.add(cityIndex);

        return true;
    }

    public act_buyDevcard(player: Player) {
        const index = randIndexBasedValues(this.bank.devcards);
        if (index === -1) return false;

        // check if theres enough materials
        if (!VMath(player.materials).available(Store.devcard)) return false;

        // Move mats
        VMath(this.bank.materials).sameSize.add(Store.devcard);
        VMath(player.materials).sameSize.sub(Store.devcard);

        // move devcards
        this.bank.devcards[index]--;
        player.devcards[index]++;

        return true;
    }

    public act_moveRobber(
        player: Player,
        areaOffset: number,
        useDevcard: boolean
        // takeFromPlayerIndex
    ): boolean {
        // If moved by devcard and theres no enough knight devcards return false
        if (useDevcard && player.devcards[0] <= 0) return false;

        player.devcards[0] -= +useDevcard;
        this.robberArea = areaOffset;

        // Move mats
        VMath(this.bank.materials).sameSize.add(Store.devcard);
        VMath(player.materials).sameSize.sub(Store.devcard);

        // TODO: take 1 random card from a player that is near the robbed area, only 1 player he choses if theres multiple players around the same area

        return true;
    }

    public dropMaterials(player: Player, mats: MaterialList) {
        VMath(player!.materials).sameSize.sub(mats);
        VMath(this.bank.materials).sameSize.add(mats);
    }

    //////////////////// UPDATE FUNCTIONS ////////////////
    public updateLongestRoad(): boolean {
        const oldState = this.longestRoadColor;

        const dfs = (
            vertexOffset: number,
            color: number,
            visited: boolean[]
        ): number => {
            const vertex = this.vertecies[vertexOffset];

            if (
                !this.vertecies[vertexOffset] ||
                vertex.color == VertexType.AREA ||
                visited[vertexOffset - AREAS]
            )
                return 0;

            visited[vertexOffset - AREAS] = true;
            let maxChildLength = 0;

            vertex.edges.forEach((edge) => {
                if (edge.color === color) {
                    maxChildLength = Math.max(
                        maxChildLength,
                        dfs(edge.offset, color, visited)
                    );
                }
            });

            return maxChildLength + 1;
        };

        const dfsScore = (color: number) => {
            let maxRoadLength = 0;

            for (
                let vertexOffset = 0;
                vertexOffset < VERTECIES;
                vertexOffset++
            ) {
                const visited = Array(VERTECIES).fill(false);

                maxRoadLength = Math.max(
                    maxRoadLength,
                    dfs(vertexOffset + AREAS, color, visited) - 1
                );
            }

            return maxRoadLength;
        };

        const lengths = this.players.map((player) => {
            return (player.maxRoad = dfsScore(player.id));
        });

        const maxLength = VMath(lengths).max();

        if (VMath(lengths).counts(maxLength) > 1) {
            return false;
        }

        if (maxLength < 5) {
            this.longestRoadColor = -1;
            return false;
        }

        this.longestRoadColor = VMath(lengths).maxIndex();
        const stateChanged = oldState !== this.longestRoadColor;

        return stateChanged;
    }
}
