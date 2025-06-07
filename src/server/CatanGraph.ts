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
import { Deal } from "@/types/deal";
import { ListSet } from "@/structs/list-set";
const MIDDLE_INDEX = 9;

export class Catan {
    private vertecies: Vertex[];

    public players: Player[];
    public availableIds: ListSet<number>;
    private robberArea: number;
    public bank: { materials: number[]; devcards: number[] };
    private turnId: number;
    private harborsMats: number[];
    private round: number;
    private preTurns: (number | boolean)[];

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

        this.preTurns = [0, 1, 2, 3, true, 3, 2, 1, 0, true];
        this.round = 0;
        this.availableIds = new ListSet([0, 1, 2, 3], (a, b) => b - a);

        this.turnId = -1;
        this.robberArea = MIDDLE_INDEX;
        this.players = [];

        this.harborsMats = [
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
        ArrayShuffle(this.harborsMats);

        for (let offset = 0; offset < this.harborsMats.length; offset++) {
            this.vertecies[HarborsArray[offset * 2] + AREAS].harbor =
                this.vertecies[HarborsArray[offset * 2 + 1] + AREAS].harbor =
                    this.harborsMats[offset];
        }
    }
    /////////////////// PLAYER /////////////////
    public get playerCount() {
        return this.players.length;
    }

    public playerJoin(name: string, socket: Socket): Player | null {
        const id = this.availableIds.pop();
        if (id === undefined) return null;

        const player = new Player(id, name, socket, this);
        this.players.push(player);

        return player;
    }

    public disconnect(player: Player) {
        try {
            const { id } = player;
            this.availableIds.add(id);

            this.players = this.players.filter((p) => p.id !== id);
        } catch (err) {
            console.error("server.catan.disconnect error", err);
        }
    }

    /////////////////// EXPORT /////////////////
    public json() {
        const { robberArea, bank } = this;

        return {
            harbors: this.harborsMats,
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
        const dices = [randInt(1, 6), randInt(1, 6)];
        // const dices = [1, 6];
        // const dices = [1, 3];
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

                const vertecies: {
                    vertex: number;
                    mat: number;
                    color: number;
                }[] = [];

                edges.forEach(({ offset, vertex }) => {
                    if (vertex.color !== VertexType.AREA) {
                        vertecies.push({
                            color: vertex.color,
                            vertex: offset,
                            mat,
                        });
                    }
                });

                return vertecies;
            })
            .filter(({ color }) => color < MAX_PLAYERS);

        const addons =
            dicesSum == 7
                ? []
                : this.players.map(({ id, cities }) => {
                      const mats = [0, 0, 0, 0, 0];

                      const materials: number[] = [];

                      areas.forEach(({ mat, color, vertex }) => {
                          if (color === id) {
                              if (cities.has(vertex - AREAS)) {
                                  materials.push(mat);
                              }
                              materials.push(mat);
                          }
                      });

                      VMath(mats).countpicks(materials);

                      return { from: id, mats };
                  });

        // notify all players they have to give materials, once!
        dicesSum == 7 &&
            this.players.forEach((player) => (player.sevenNeedToGive = true));

        return {
            dices,
            addons,
        };
    }

    public act_stopTurn(): { turnId: number; round: number } {
        if (this.preTurns.length) {
            do {
                const state = this.preTurns.shift();
                if (state === undefined) {

                    break;
                } else if (typeof state === "boolean") {
                    this.round++;
                } else {
                    this.turnId = state;

                    if (this.players[this.turnId] !== undefined) break;
                }
            } while (true);
        } else {

            this.turnId++;
            if (this.turnId >= this.players.length) {
                this.turnId = 0;

                this.round++;
            }
        }

        const { round, turnId } = this;
        return { round, turnId };
    }

    public act_buyRoad(
        player: Player,
        roadFrom: number,
        roadTo: number,
        useMoney: boolean = true
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

        // first two rounds roads dont cost
        if (useMoney && this.round < 2) {
            useMoney = false;
        }

        // check if theres enough materials
        if (useMoney && !VMath(player.materials).available(Store.road))
            return false;

        // Move mats
        useMoney && VMath(this.bank.materials).sameSize.add(Store.road);
        useMoney && VMath(player.materials).sameSize.sub(Store.road);

        const paint = (from: number, to: number, color: number) => {
            this.vertecies[from].edges.get(to)!.color = color;
        };

        // Paint
        paint(roadFrom, roadTo, player.id);
        paint(roadTo, roadFrom, player.id);

        // Add to map
        player.roads.add([roadFrom, roadTo]);
        player.amounts.road--;

        return true;
    }

    private collectMaterialsBaseSettlement(
        player: Player,
        settlementIndex: number
    ) {
        const mats: number[] = [];

        this.vertecies[settlementIndex + AREAS].edges.forEach(
            ({ offset, vertex }) => {
                if (offset < AREAS) {
                    const material = vertex.material?.material;
                    material !== undefined && mats.push(material);
                }
            }
        );

        VMath(player.materials).countpicks(mats);
    }

    public act_buySettlement(player: Player, settlementIndex: number): boolean {
        let useMoney = true;

        // check if settlement already bought
        if (
            player.settlements.has(settlementIndex) ||
            this.vertecies[settlementIndex + AREAS].color !==
                VertexType.SETTLEMENT
        )
            return false;

        // check if theres enough amounts
        if (player.amounts.settlement <= 0) return false;

        // first two rounds settlements dont cost
        if (this.round < 2) {
            useMoney = false;
        }

        // check if theres enough materials
        if (useMoney && !VMath(player.materials).available(Store.settlement))
            return false;

        // Move mats
        useMoney && VMath(this.bank.materials).sameSize.add(Store.settlement);
        useMoney && VMath(player.materials).sameSize.sub(Store.settlement);

        // Paint
        this.vertecies[settlementIndex + AREAS].color = player.id;

        // Add to map
        player.settlements.add(settlementIndex);
        player.amounts.settlement--;

        // if round index is 1 then give them materials
        if (this.round === 1) {
            this.collectMaterialsBaseSettlement(player, settlementIndex);
        }

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
        player.amounts.city--;

        return true;
    }

    public act_buyDevcard(player: Player): false | number {
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

        return index;
    }

    public knightTake(
        player: Player,
        fromId: number
    ): { fromId: number; mat: number } {
        const mat = randIndexBasedValues(this.players[fromId].materials);
        if (mat === -1) return { fromId, mat };

        player.materials[mat]++;
        this.players[fromId].materials[mat]--;

        return { fromId, mat };
    }

    public act_moveRobber(
        player: Player,
        areaOffset: number,
        useDevcard: boolean
        // takeFromPlayerIndex
    ): false | { picks?: number[]; tooks?: { fromId: number; mat: number } } {
        // If moved by devcard and theres no enough knight devcards return false
        if (useDevcard && player.devcards[0] <= 0) return false;

        player.devcards[0] -= +useDevcard;
        player.knightUsed += +useDevcard;
        this.robberArea = areaOffset;

        const picksSet = new Set<number>();

        this.vertecies[areaOffset].edges.forEach(({ vertex }) => {
            if (vertex.color < MAX_PLAYERS && vertex.color !== player.id)
                picksSet.add(vertex.color);
        });

        const picks = Array.from(picksSet.values());

        if (picksSet.size === 0) return {};

        if (picksSet.size === 1)
            return {
                tooks: this.knightTake(player, picks[0]),
            };

        return { picks };
    }

    public dropMaterials(player: Player, mats: MaterialList) {
        // check if player have those materials
        if (!VMath(player.materials).available(mats)) return false;

        // check if player needs to drop materials
        if (!player.sevenNeedToGive) return false;

        VMath(player!.materials).sameSize.sub(mats);
        VMath(this.bank.materials).sameSize.add(mats);

        player.sevenNeedToGive = false;

        return true;
    }

    public dev_yearOfPlenty(player: Player, mats: MaterialList) {
        // check if player has enough devcards
        if (player.devcards[3] <= 0) return false;

        // check if theres enough materials
        if (!VMath(this.bank.materials).available(mats)) return false;

        player.devcards[3]--;

        // Move mats
        VMath(this.bank.materials).sameSize.sub(mats);
        VMath(player.materials).sameSize.add(mats);

        return true;
    }

    public dev_monopol(local: Player, mat: number) {
        // check if player has enough devcards
        if (local.devcards[4] <= 0) return false;

        // pay
        local.devcards[4]--;

        // Move from each player to the local player
        for (const xplayer of this.players) {
            if (xplayer.id === local.id) continue;

            const materials = [...xplayer.materials] as MaterialList;
            const matCount = materials[mat];
            materials[mat] = 0;

            xplayer.materials = materials;

            local.materials[mat] += matCount;
        }

        return true;
    }

    public dev_road(player: Player, from: number, to: number) {
        // check if player has enough devcards
        if (player.devcards[2] <= 0) return false;

        player.devcards[2] -= +player.twoRoadsState;
        player.twoRoadsState = !player.twoRoadsState;

        this.act_buyRoad(player, from, to, false);

        return true;
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

    public updateLargestArmy(): boolean {
        const oldState = this.largestArmyColor;

        const lengths = this.players.map((player) => player.knightUsed);
        const maxLength = VMath(lengths).max();

        if (VMath(lengths).counts(maxLength) > 1) {
            return false;
        }

        if (maxLength < 3) {
            this.largestArmyColor = -1;
            return false;
        }

        this.largestArmyColor = VMath(lengths).maxIndex();
        const stateChanged = oldState !== this.largestArmyColor;

        return stateChanged;
    }

    public checkWin(): false | number {
        const vps = this.players.map((p) => p.realVictoryPoints);
        const maxValue = VMath(vps).max();

        if (maxValue < 10) return false;

        const maxIndex = VMath(vps).maxIndex();
        return this.players[maxIndex].id;
    }

    public calculateTrades(player: Player): Deal[] {
        const harbors = new Set(
            Array.from(player.settlements.values())
                .filter(
                    (vertex) =>
                        this.vertecies[vertex + AREAS].harbor !== undefined
                )
                .map((vertex) => this.vertecies[vertex + AREAS].harbor!)
        );

        const deals: Deal[] = [];

        for (let matIndex = 0; matIndex < 5; matIndex++) {
            const specificHarbor = [
                harbors.has(matIndex) && player.materials[matIndex] > 1,
                2,
            ];
            const generalHarbor = [
                harbors.has(5) && player.materials[matIndex] > 2,
                3,
            ];
            const bankDeal = [player.materials[matIndex] > 3, 4];

            for (const [condition, count] of [
                specificHarbor,
                generalHarbor,
                bankDeal,
            ] as [boolean, number][]) {
                condition &&
                    deals.push({
                        from: matIndex,
                        count,
                    });
            }
        }

        return deals;
    }

    public applyTrade(player: Player, from: number, to: number, count: number) {
        let allowed = true;

        if (count < 4) {
            const harbors = new Set(
                Array.from(player.settlements.values())
                    .filter(
                        (vertex) =>
                            this.vertecies[vertex + AREAS].harbor !== undefined
                    )
                    .map((vertex) => this.vertecies[vertex + AREAS].harbor!)
            );

            switch (count) {
                case 3:
                    allowed = harbors.has(5);
                    break;
                case 2:
                    allowed = harbors.has(from);
                    break;
                default:
                    return false;
            }
        }

        if (!allowed) return false;

        const give = [0, 0, 0, 0, 0];
        give[from] = count;

        const get = [0, 0, 0, 0, 0];
        get[to] = 1;

        // if player and bank dont have those materials
        if (!VMath(player.materials).available(give)) return false;
        if (!VMath(this.bank.materials).available(get)) return false;

        VMath(this.bank.materials).sameSize.add(give);
        VMath(player.materials).sameSize.sub(give);

        VMath(this.bank.materials).sameSize.sub(get);
        VMath(player.materials).sameSize.add(get);

        return true;
    }
}
