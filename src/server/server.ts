import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { Catan } from "./CatanGraph";
import { Server } from "./sockets";
import { Player } from "./Player";
import VMath from "@/utils/VMath";
import { MaterialList } from "@/types/materials";
import { Lobby } from "./Lobby";
import { TradesSet } from "./TradesSet";

const empty = [0, 0, 0, 0, 0];

export default function createServer(onOpen?: (server: Server) => void) {
    const catan = new Catan();
    const lobby = new Lobby();
    const trades = new TradesSet();

    new Server(
        (self) => {
            onOpen?.(self);
        },
        (socket, server) => {
            let local: Player | null = null;

            socket.middleware(() => {
                const state = catan.checkWin();

                if (state !== false) {
                    const players = catan.players.map(
                        ({ id, devcards, victoryPoints }) => ({
                            id,
                            vp: victoryPoints,
                            vpdc: devcards[1],
                        })
                    );

                    lobby.sockets.emit(ClientCodes.WIN, { id: state, players });
                }
            });

            socket.on(ServerCodes.INIT, (name: string) => {
                if (lobby.ready) {
                    socket.emit(ClientCodes.STATUS, 2);

                    return socket.disconnect();
                }
                local = catan.playerJoin(name, socket);

                if (local === null) {
                    socket.emit(
                        ClientCodes.STATUS,
                        catan.playerCount < 4 ? 0 : 1
                    );

                    return socket.disconnect();
                }

                lobby.join(socket);

                socket.emit(ClientCodes.INIT, {
                    ...catan.json(),
                    id: local.id,
                    onlines: catan.players
                        .filter((v) => v.id !== local!.id)
                        .map(({ id, materials, devcards, name }) => ({
                            id,
                            name,
                            materials: VMath(materials).sum(),
                            devcards: VMath(devcards).sum(),
                        })),
                });

                lobby.sockets.emitExcept(socket, ClientCodes.PLAYER_JOIN, {
                    id: local.id,
                    name: local.name,
                    materials: VMath(local.materials).sum(),
                    devcards: VMath(local.devcards).sum(),
                });
            });

            socket.on(ServerCodes.ROLL, () => {
                lobby.sockets.emit(ClientCodes.TURN_DICE, catan.act_rollDice());
            });

            socket.on(ServerCodes.MESSAGE, (message) => {
                lobby.sockets.emit(ClientCodes.MESSAGE, {
                    from: local!.id,
                    date: new Date().getTime(),
                    message,
                });
            });

            socket.on(ServerCodes.STOP_TURN, () => {
                lobby.sockets.emit(
                    ClientCodes.TURN_SWITCH,
                    catan.act_stopTurn()
                );
            });

            socket.on(ServerCodes.READY, () => {
                lobby.sockets.emit(ClientCodes.READY, [
                    local!.id,
                    lobby.toggleReady(socket),
                ]);

                if (lobby.ready) {
                    lobby.sockets.emit(ClientCodes.START_GAME);

                    lobby.sockets.emit(
                        ClientCodes.TURN_SWITCH,
                        catan.act_stopTurn()
                    );
                }
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
                player.socket.emit(ClientCodes.PLAYER_UPDATE, {
                    ...data,
                    vp: player.victoryPoints,
                    materials: player.materials,
                });
                lobby.sockets.emit(ClientCodes.BANK_UPDATE, catan.bank);

                lobby.sockets.emitExcept(
                    player.socket,
                    ClientCodes.OTHER_UPDATE,
                    {
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
                    }
                );
            };

            const achivementsUpdate = () => {
                lobby.sockets.emit(
                    ClientCodes.ACHIVEMENTS_UPDATE,
                    catan.json_achivements()
                );
            };

            socket.on(ServerCodes.DROP_MATS, (mats: MaterialList) => {
                const state = catan.dropMaterials(local!, mats);

                state && deckUpdate({});
            });

            socket.on(
                ServerCodes.BUY_ROAD,
                ([roadFrom, roadTo]: [number, number]) => {
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
                const state = catan.act_buyDevcard(local!);
                if (state !== false) {
                    deckUpdate({
                        devcards: local!.devcards,
                    });

                    const devs = [0, 0, 0, 0, 0];
                    devs[state]++;
                    socket.emit(ClientCodes.MATS_NOTIFICATION, [empty, devs]);
                }
            });

            const knightPick = ({ fromId, mat }: Record<string, number>) => {
                deckUpdate({}, catan.players[fromId]);

                catan.players[fromId].socket.emit(ClientCodes.KNIGHT_FROM, {
                    from: local!.id,
                    mat,
                });

                const addons = [0, 0, 0, 0, 0];
                addons[mat] = 1;

                socket.emit(ClientCodes.MATS_NOTIFICATION, [addons, empty]);
            };

            socket.on(ServerCodes.KNIGHT_PICK, (pickId: number) => {
                knightPick(catan.knightTake(local!, pickId));
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
                    const state = catan.act_moveRobber(
                        local!,
                        areaOffset,
                        useDevcard
                    );

                    if (state !== false) {
                        if (useDevcard) {
                            if (catan.updateLargestArmy()) {
                                achivementsUpdate();
                            }

                            deckUpdate({
                                devcards: local!.devcards,
                                knightUsed: local!.knightUsed,
                            });
                        }

                        lobby.sockets.emit(ClientCodes.MOVE_ROBBER, areaOffset);

                        if (state.picks) {
                            socket.emit(ClientCodes.KNIGHT_PICKS, state.picks);
                        } else if (state.tooks) {
                            knightPick(state.tooks);
                        }
                    }
                }
            );

            socket.on(ServerCodes.DEV_YEAROFPLENTY, (mats: MaterialList) => {
                if (catan.dev_yearOfPlenty(local!, mats)) {
                    deckUpdate({
                        devcards: local!.devcards,
                    });

                    socket.emit(ClientCodes.MATS_NOTIFICATION, [mats, empty]);
                }
            });

            socket.on(ServerCodes.DEV_MONOPOL, (matIndex: number) => {
                const old = local!.materials[matIndex];
                if (catan.dev_monopol(local!, matIndex)) {
                    const current = local!.materials[matIndex];

                    deckUpdate({
                        devcards: local!.devcards,
                    });

                    catan.players.forEach((xplayer) => {
                        deckUpdate({}, xplayer);
                    });

                    lobby.sockets.emit(ClientCodes.DEV_MONOPOL, {
                        from: local!.id,
                        mat: matIndex,
                    });

                    const addon = [0, 0, 0, 0, 0];
                    addon[matIndex] = current - old;

                    socket.emit(ClientCodes.MATS_NOTIFICATION, [addon, empty]);
                }
            });

            socket.on(ServerCodes.DEV_ROADS, ([from, to]) => {
                if (catan.dev_road(local!, from, to)) {
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
            });

            socket.on(ServerCodes.REQUEST_TRADES, () => {
                const trades = catan.calculateTrades(local!);

                socket.emit(ClientCodes.GET_TRADES, trades);
            });

            socket.on(
                ServerCodes.APPLY_TRADE,
                ({ from, to, count }: Record<string, number>) => {
                    if (catan.applyTrade(local!, from, to, count)) {
                        deckUpdate({});

                        const addon = [0, 0, 0, 0, 0];
                        addon[to] = 1;

                        socket.emit(ClientCodes.MATS_NOTIFICATION, [
                            addon,
                            empty,
                        ]);
                    }
                }
            );

            socket.on(
                ServerCodes.OFFER_TRADE,
                ({ players, mats }: { players: number[]; mats: number[] }) => {
                    trades.add(
                        local!,
                        players.map((playerId) => catan.players[playerId]),
                        mats
                    );
                }
            );

            socket.on(ServerCodes.CANCEL_TRADE, (id: number) => {
                trades.cancel(id, local!);
            });

            socket.on(ServerCodes.REJECT_TRADE, (id: number) => {
                trades.reject(id, local!);
            });

            socket.on(ServerCodes.ACCEPT_TRADE, (id: number) => {
                const state = trades.accept(id, local!);

                if (state !== false) {
                    const { mats, from } = state;

                    VMath(from.materials).sameSize.add(mats);
                    VMath(local!.materials).sameSize.sub(mats);

                    deckUpdate({});
                    deckUpdate({}, from);

                    const acceptedAddons = mats.map(
                        (value) => -Math.min(0, value)
                    );
                    socket.emit(ClientCodes.MATS_NOTIFICATION, [
                        acceptedAddons,
                        empty,
                    ]);

                    const offeredAddons = mats.map((value) =>
                        Math.max(0, value)
                    );
                    from.socket.emit(ClientCodes.MATS_NOTIFICATION, [
                        offeredAddons,
                        empty,
                    ]);
                }
            });

            socket.on("disconnect", () => {
                if (!lobby.has(socket)) return;

                if (lobby.ready) {
                    lobby.sockets.emitExcept(socket, ClientCodes.STOP);
                    server.stop();
                } else {
                    lobby.sockets.emitExcept(
                        socket,
                        ClientCodes.DISCONNECTED,
                        local!.id
                    );

                    lobby.disconnect(socket);
                    local && catan.disconnect(local);

                    if (lobby.size <= 0) {
                        server.stop();
                    }
                }
            });
        }
    );
}
