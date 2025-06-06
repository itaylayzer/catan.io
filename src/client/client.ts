import Catan2D from "@/components/catan/map/Catan2D";
import { convertions } from "@/components/catan/map/configs";
import { MaterialNotify } from "@/components/catan/notifications/MaterialNotify";
import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { Socket } from "@/server/sockets";
import { CatanStore, UITurnState } from "@/store/useCatanStore";
import { DevcardList, MaterialList } from "@/types/materials";
import { randIntNot } from "@/utils/randIntNot";
import VMath from "@/utils/VMath";

export function handleSocket(
    socket: Socket,
    set: {
        (
            partial:
                | CatanStore
                | Partial<CatanStore>
                | ((state: CatanStore) => CatanStore | Partial<CatanStore>),
            replace?: false
        ): void;
        (
            state: CatanStore | ((state: CatanStore) => CatanStore),
            replace: true
        ): void;
    },
    get: () => CatanStore
) {
    const setTurnState = (state: UITurnState) => {
        set((old) => ({
            ui: {
                ...old.ui,
                dicesState: state,
            },
        }));
    };

    socket.on(
        ClientCodes.INIT,
        ({
            harbors,
            materials,
            bank,
            id,
            robberArea,
            onlines: xplayers,
        }: {
            harbors: number[];
            materials: [
                number,
                {
                    num: number;
                    material: number;
                }
            ][];
            bank: {
                materials: number[];
                devcards: number[];
            };
            id: number;
            robberArea: number;
            onlines: {
                id: number;
                name: string;
                materials: number;
                devcards: number;
            }[];
        }) => {
            const materialsMap = new Map(
                materials.map(([index, { num, material }]) => {
                    return [
                        index,
                        {
                            num,
                            material: convertions.matsNaming[material],
                        },
                    ];
                })
            );

            set((old) => ({
                harbors,
                materials: materialsMap,
                robberArea,
                bank: {
                    devcards: bank.devcards as DevcardList,
                    materials: bank.materials as DevcardList,
                },
                client: {
                    socket,
                    id,
                },
                local: {
                    ...old.local,
                    color: id,
                },
            }));
            requestAnimationFrame(function animate() {
                if (get().harbors.length > 0) {
                    set((old) => ({ ui: { ...old.ui, mapState: "ready" } }));
                } else {
                    requestAnimationFrame(animate);
                }
            });

            const { onlines } = get();
            onlines.forEach((_, key) => onlines.delete(key));

            for (const xplayer of xplayers) {
                const { devcards, id, materials, name } = xplayer;

                onlines.set(id, {
                    devcards,
                    color: id,
                    materials,
                    name,
                    cities: [],
                    knightUsed: 0,
                    maxRoad: 0,
                    roads: [],
                    settlements: [],
                    victoryPoints: 0,
                    ready: false,
                });
            }
            set({ onlines: new Map(onlines) });
        }
    );

    socket.on(
        ClientCodes.READY,
        ([playerId, readyState]: [number, boolean]) => {
            if (playerId === get().local.color) {
                set((old) => ({
                    local: {
                        ...old.local,
                        ready: readyState,
                    },
                }));
            } else {
                const { onlines } = get();

                const xplayer = onlines.get(playerId);
                if (xplayer) {
                    xplayer.ready = readyState;

                    onlines.set(playerId, xplayer);

                    set({ onlines: new Map(onlines) });
                }
            }
        }
    );

    socket.on(ClientCodes.DISCONNECTED, (playerId) => {
        const { onlines } = get();

        if (onlines.delete(playerId)) {
            set({ onlines: new Map(onlines) });
        }
    });

    socket.on(ClientCodes.STOP, () => {
        get().ui.events.emit("stop midgame");
    });

    socket.on(ClientCodes.STATUS, (code: number) => {
        const message = [
            "unkown error",
            "max players amount has reached his limit",
            "game has started",
        ][code];

        get().ui.events.emit("status", message);
    });

    socket.on(ClientCodes.START_GAME, () => {
        set((old) => ({ ui: { ...old.ui, gameStarted: true } }));
    });

    socket.on(
        ClientCodes.PLAYER_JOIN,
        (xplayer: {
            id: number;
            name: string;
            materials: number;
            devcards: number;
        }) => {
            const { onlines } = get();
            const { devcards, id, materials, name } = xplayer;

            onlines.set(id, {
                devcards,
                color: id,
                materials,
                name,
                cities: [],
                knightUsed: 0,
                maxRoad: 0,
                roads: [],
                settlements: [],
                victoryPoints: 0,
                ready: false,
            });

            set({ onlines: new Map(onlines) });
        }
    );

    socket.on(
        ClientCodes.TURN_DICE,
        ({
            dices,
            addons,
        }: {
            dices: [number, number];
            addons: { from: number; mats: MaterialList }[];
        }) => {
            setTurnState("rolling");
            set({
                dices: [
                    randIntNot(1, 6, [dices[0]]),
                    randIntNot(1, 6, [dices[1]]),
                ],
            });

            setTimeout(() => {
                set({ dices });
            }, 100);

            get().ui.events.once("dices finished", () => {
                addons.forEach(({ from, mats }) => {
                    if (from === get().local.color) {
                        VMath(get().local.materials).sameSize.add(mats);

                        get().ui.events.emit("render decks");
                        if (VMath(mats).sum() > 0)
                            MaterialNotify.instance.wake({ mats });
                    } else {
                        const xplayer = get().onlines.get(from);
                        xplayer && (xplayer.materials += VMath(mats).sum());
                    }
                });

                if (dices[0] + dices[1] === 7) {
                    // If local is the current turn then move robber
                    if (get().turnId === get().local.color) {
                        set((old) => ({
                            ui: {
                                ...old.ui,
                                mapState: "picking area",
                            },
                        }));

                        get().ui.events.once("picked area", (index) => {
                            get().ui.events.emit("dock 7 free");
                            socket.emit(ServerCodes.MOVE_ROBBER, {
                                areaOffset: index,
                                useDevcard: false,
                            });
                        });
                    }

                    // If local materials are bigger then 6 then drop mats
                    if (VMath(get().local.materials).sum() > 6) {
                        get().ui.events.emit("7");

                        get().ui.events.once("7 give", (values) => {
                            socket.emit(ServerCodes.DROP_MATS, values);
                        });
                    }
                }

                if (get().turnId === get().local.color) {
                    setTurnState("mine");
                } else {
                    setTurnState("others");
                }
            });
        }
    );

    socket.on(
        ClientCodes.MATS_NOTIFICATION,
        ([mats, devs]: [MaterialList, DevcardList]) => {
            MaterialNotify.instance.wake({ mats, devs });
        }
    );

    socket.on(
        ClientCodes.WIN,
        ({
            id,
            players,
        }: {
            id: number;
            players: { id: number; vp: number; vpdc: number }[];
        }) => {
            get().ui.events.emit("win", id, players);
        }
    );

    socket.on(ClientCodes.MOVE_ROBBER, (robberArea) => {
        set({ robberArea });
        set((old) => ({
            ui: {
                ...old.ui,
                mapState: "ready",
            },
        }));
    });

    socket.on(
        ClientCodes.TURN_SWITCH,
        ({ turnId, round }: { turnId: number; round: number }) => {
            console.log("client.turn turn=", turnId, "round=", round);
            const myTurn = turnId === get().local.color;

            if (round === 2) {
                set({ firstRounds: false });
            }

            if (myTurn) {
                switch (round) {
                    case 0:
                    case 1: {
                        const { events } = get().ui;

                        set((old) => ({
                            ui: { ...old.ui, mapState: "picking vertex" },
                        }));

                        // pick vertex
                        events.once("picked vertex", (index) => {
                            socket?.emit(ServerCodes.BUY_SETTLEMENT, index);

                            if (round === 1) {
                                set({ secondSettlement: index });
                            }
                            set((old) => ({
                                ui: { ...old.ui, mapState: "ready" },
                            }));

                            setTimeout(() => {
                                set((old) => ({
                                    ui: { ...old.ui, mapState: "picking edge" },
                                }));

                                // pick edge
                                events.once(
                                    "picked edge",
                                    (from: number, to: number) => {
                                        socket.emit(ServerCodes.BUY_ROAD, [
                                            from,
                                            to,
                                        ]);

                                        set((old) => ({
                                            ui: {
                                                ...old.ui,
                                                mapState: "ready",
                                            },
                                        }));

                                        setTimeout(() => {
                                            set({
                                                secondSettlement: undefined,
                                            });

                                            socket.emit(ServerCodes.STOP_TURN);
                                        }, 50);
                                    }
                                );
                            }, 50);
                        });
                        break;
                    }
                }
            }

            set({ turnId });
            setTurnState(turnId === get().local.color ? "ready" : "others");
        }
    );

    socket.on(
        ClientCodes.PLAYER_UPDATE,
        (
            data: Partial<{
                amounts: Record<"road" | "settlement" | "city", number>;
                settlements: number[];
                cities: number[];
                roads: [number, number][];
                materials: MaterialList;
                devcards: MaterialList;
                maxRoad: number;
                knightUsed: number;
            }> & { vp: number }
        ) => {
            const local = { ...get().local };
            if (data.amounts) local.amounts = data.amounts;
            if (data.settlements) local.settlements = data.settlements;
            if (data.cities) local.cities = data.cities;
            if (data.roads) local.roads = data.roads;
            if (data.materials) local.materials = data.materials;
            if (data.devcards) local.devcards = data.devcards;
            if (data.maxRoad) local.maxRoad = data.maxRoad;
            if (data.knightUsed) local.knightUsed = data.knightUsed;
            local.victoryPoints = data.vp;

            set({ local });
            Catan2D.instance?.forceUpdate();
        }
    );

    socket.on(
        ClientCodes.BANK_UPDATE,
        (data: { materials: MaterialList; devcards: DevcardList }) => {
            set({ bank: data });
        }
    );

    socket.on(
        ClientCodes.DEV_MONOPOL,
        ({ from, mat }: Record<"from" | "mat", number>) => {
            get().ui.events.emit("monopol show", from, mat);
        }
    );

    socket.on(
        ClientCodes.OTHER_UPDATE,
        (
            data: Record<
                | "id"
                | "materials"
                | "devcards"
                | "vp"
                | "maxRoad"
                | "knightUsed",
                number
            > &
                Partial<Record<"cities" | "settlements", number[]>> & {
                    roads?: [number, number][];
                }
        ) => {
            const player = get().onlines.get(data.id)!;
            player.materials = data.materials;
            player.devcards = data.devcards;
            if (data.roads) player.roads = data.roads;
            if (data.cities) player.cities = data.cities;
            if (data.settlements) player.settlements = data.settlements;
            if (data.maxRoad) player.maxRoad = data.maxRoad;
            if (data.knightUsed) player.knightUsed = data.knightUsed;

            player.victoryPoints = data.vp;

            get().onlines.set(data.id, { ...player });
            set({ onlines: new Map(get().onlines) });
        }
    );

    socket.on(
        ClientCodes.ACHIVEMENTS_UPDATE,
        ({
            largestArmy,
            longestRoad,
        }: {
            longestRoad: number;
            largestArmy: number;
        }) => {
            set({ largestArmy, longestRoad });
        }
    );

    socket.on(ClientCodes.GET_TRADES, (trades) => {
        get().ui.events.emit("trade requests", trades);
    });

    socket.emit(ServerCodes.INIT, get().local.name);

    set({ client: { socket, id: -1 } });
}
