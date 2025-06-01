import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { Catan } from "./CatanGraph";
import { Server } from "./sockets";
import { Player } from "./Player";
import VMath from "@/utils/VMath";
import { MaterialList } from "@/types/materials";

export default function createServer(onOpen?: (server: Server) => void) {
    const catan = new Catan();

    new Server(
        (self) => {
            onOpen?.(self);
        },
        (socket) => {
            let local: Player | null = null;
            socket.on(ServerCodes.INIT, (name: string) => {
                local = catan.playerJoin(name, socket);

                socket.emit(ClientCodes.INIT, {
                    ...catan.json(),
                    id: local.id,
                });
            });

            socket.on(ServerCodes.STATUS, () => {
                socket.emit(ClientCodes.STATUS, catan.playerCount < 4);
            });

            socket.on(ServerCodes.ROLL, () => {
                socket.emit(ClientCodes.TURN_DICE, catan.act_rollDice());
            });

            socket.on(ServerCodes.MESSAGE, (message) => {
                catan.sockets.emit(ClientCodes.MESSAGE, {
                    from: local!.id,
                    date: new Date().getTime(),
                    message,
                });
            });

            socket.on(ServerCodes.STOP_TURN, () => {
                catan.sockets.emit(
                    ClientCodes.TURN_SWITCH,
                    catan.act_stopTurn()
                );
            });

            socket.on(ServerCodes.DROP_MATS, (mats: MaterialList) => {
                catan.dropMaterials(local!, mats);

                deckUpdate({});
            });

            const deckUpdate = (
                data: Partial<{
                    amounts: Record<"road" | "settlement" | "city", number>;
                    settlements: number[];
                    cities: number[];
                    roads: [number, number][];
                    devcards: number[];
                    maxRoad: number;
                    knightUsed: number;
                }>,
                player: Player = local!
            ) => {
                socket.emit(ClientCodes.PLAYER_UPDATE, {
                    ...data,
                    vp: player.victoryPoints,
                    materials: player.materials,
                });
                catan.sockets.emit(ClientCodes.BANK_UPDATE, catan.bank);

                catan.sockets.emitExcept(player.id, ClientCodes.OTHER_UPDATE, {
                    id: player.id,
                    materials: VMath(player.materials).sum(),
                    devcards: VMath(player.devcards).sum(),
                    vp: player.victoryPoints,
                    ...(data.roads
                        ? { roads: Array.from(player.roads.values()) }
                        : {}),
                    ...(data.cities
                        ? { cities: Array.from(player.cities.values()) }
                        : {}),
                    ...(data.settlements
                        ? {
                              settlements: Array.from(
                                  player.settlements.values()
                              ),
                          }
                        : {}),
                    ...(data.maxRoad === undefined
                        ? {}
                        : { maxRoad: data.maxRoad }),
                    ...(data.knightUsed === undefined
                        ? {}
                        : { knightUsed: data.knightUsed }),
                });
            };

            const achivementsUpdate = () => {
                catan.sockets.emit(
                    ClientCodes.ACHIVEMENTS_UPDATE,
                    catan.json_achivements()
                );
            };

            socket.on(
                ServerCodes.BUY_ROAD,
                ([roadFrom, roadTo]: [number, number]) => {
                    console.log("server", "buy_road", "input", [
                        roadFrom,
                        roadTo,
                    ]);
                    if (
                        catan.act_buyRoad(
                            local!,
                            Math.min(roadFrom, roadTo),
                            Math.max(roadFrom, roadTo)
                        )
                    ) {
                        if (catan.updateLongestRoad()) {
                            achivementsUpdate();
                        }

                        deckUpdate({
                            amounts: local!.amounts,
                            roads: Array.from(local!.roads.values()),
                            maxRoad: local!.maxRoad,
                        });
                    }
                }
            );

            socket.on(ServerCodes.BUY_CITY, (cityIndex: number) => {
                if (catan.act_buyCity(local!, cityIndex)) {
                    deckUpdate({
                        amounts: local!.amounts,
                        cities: Array.from(local!.cities.values()),
                    });
                }
            });

            socket.on(ServerCodes.BUY_SETTLEMENT, (settlementIndex: number) => {
                if (catan.act_buySettlement(local!, settlementIndex)) {
                    deckUpdate({
                        amounts: local!.amounts,
                        settlements: Array.from(local!.settlements.values()),
                    });
                }
            });

            socket.on(ServerCodes.BUY_DEVCARD, () => {
                if (catan.act_buyDevcard(local!)) {
                    deckUpdate({
                        devcards: local!.devcards,
                    });
                }
            });

            socket.on(
                ServerCodes.MOVE_ROBBER,
                ({
                    areaOffset,
                    useDevcard,
                }: {
                    areaOffset: number;
                    useDevcard: boolean;
                }) => {
                    if (catan.act_moveRobber(local!, areaOffset, useDevcard)) {
                        if (useDevcard) {
                            deckUpdate({
                                devcards: local!.devcards,
                                knightUsed: local!.knightUsed,
                            });

                            if (catan.updateLargestArmy()) {
                                achivementsUpdate();
                            }
                        }

                        catan.sockets.emit(ClientCodes.MOVE_ROBBER, areaOffset);
                    }
                }
            );

            socket.on(ServerCodes.DEV_YEAROFPLENTY, (mats: MaterialList) => {
                if (catan.dev_yearOfPlenty(local!, mats)) {
                    deckUpdate({
                        devcards: local!.devcards,
                    });
                }
            });

            socket.on(ServerCodes.DEV_MONOPOL, (matIndex: number) => {
                if (catan.dev_monopol(local!, matIndex)) {
                    deckUpdate({
                        devcards: local!.devcards,
                    });

                    catan.players.forEach((xplayer) => {
                        deckUpdate({}, xplayer);
                    });

                    catan.sockets.emit(ClientCodes.DEV_MONOPOL, {
                        from: local!.id,
                        mat: matIndex,
                    });
                }
            });

            socket.on(
                ServerCodes.DEV_ROADS,
                ([firstFrom, firstTo, secondFrom, secondTo]) => {
                    if (
                        catan.dev_road(
                            local!,
                            firstFrom,
                            firstTo,
                            secondFrom,
                            secondTo
                        )
                    ) {
                        if (catan.updateLongestRoad()) {
                            achivementsUpdate();
                        }

                        deckUpdate({
                            amounts: local!.amounts,
                            roads: Array.from(local!.roads.values()),
                            maxRoad: local!.maxRoad,
                            devcards: local!.devcards,
                        });
                    }
                }
            );
        }
    );
}
