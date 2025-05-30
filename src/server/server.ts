import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { Catan } from "./CatanGraph";
import { Server } from "./sockets";
import { Player } from "./Player";
import VMath from "@/utils/VMath";

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

            const deckUpdate = (
                data: Partial<{
                    amounts: Record<"road" | "settlement" | "city", number>;
                    settlements: number[];
                    cities: number[];
                    roads: [number, number][];
                    devcards: number[];
                    maxRoad: number;
                }>
            ) => {
                socket.emit(ClientCodes.PLAYER_UPDATE, {
                    ...data,
                    vp: local!.victoryPoints,
                    materials: local!.materials,
                });
                catan.sockets.emit(ClientCodes.BANK_UPDATE, catan.bank);

                catan.sockets.emitExcept(local!.id, ClientCodes.OTHER_UPDATE, {
                    id: local!.id,
                    materials: VMath(local!.materials).sum(),
                    devcards: VMath(local!.devcards).sum(),
                    vp: local!.victoryPoints, // TODO: calculate victory points
                    ...(data.roads
                        ? { roads: Array.from(local!.roads.values()) }
                        : {}),
                    ...(data.cities
                        ? { cities: Array.from(local!.cities.values()) }
                        : {}),
                    ...(data.settlements
                        ? {
                              settlements: Array.from(
                                  local!.settlements.values()
                              ),
                          }
                        : {}),
                    ...(data.maxRoad === undefined
                        ? {}
                        : { maxRoad: data.maxRoad }),
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
                        console.log("server", "buy_road", "inside");

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
                        amounts: local!.amounts,
                        devcards: local!.devcards,
                    });
                }
            });
        }
    );
}
