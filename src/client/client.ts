import Catan2D from "@/components/catan/map/Catan2D";
import { convertions } from "@/components/catan/map/configs";
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
                events: old.ui.events,
                mapState: old.ui.mapState,
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
        }: {
            harbors: [number, number][];
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
        }) => {
            const harborMap = new Map(harbors);

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

            set({
                harbors: harborMap,
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
                ui: {
                    mapState: "ready",
                    events: get().ui.events,
                    dicesState: get().ui.dicesState,
                },
            });
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
                    } else {
                        const xplayer = get().onlines.get(from);
                        xplayer && (xplayer.materials += VMath(mats).sum());
                    }
                });

                if (
                    dices[0] + dices[1] === 7 &&
                    VMath(get().local.materials).sum() > 6
                ) {
                    get().ui.events.emit("7");

                    set((old) => ({
                        ui: {
                            ...old.ui,
                            mapState: "picking area",
                        },
                    }));

                    get().ui.events.once("picked area", (index) => {
                        socket.emit(ServerCodes.MOVE_ROBBER, {
                            areaOffset: index,
                            useDevcard: false,
                        });
                    });

                    get().ui.events.once("7 give", (values) => {
                        socket.emit(ServerCodes.DROP_MATS, values);
                    });
                }

                if (get().turnId === get().local.color) {
                    setTurnState("mine");
                } else {
                    setTurnState("others");
                }
            });
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

    socket.on(ClientCodes.TURN_SWITCH, (turnId: number) => {
        set({ turnId });
        setTurnState(get().turnId === get().local.color ? "ready" : "others");
    });

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

    socket.emit(ServerCodes.INIT, name);

    set({ client: { socket, id: -1 } });
}
