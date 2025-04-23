import { convertions } from "@/components/catan/map/configs";
import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { nonFunction } from "@/config/objects/nonFunction";
import { Socket } from "@/server/sockets";
import { DevcardList, MaterialList } from "@/types/materials";
import { Player } from "@/types/player";
import { randIntNot } from "@/utils/randIntNot";
import { create } from "zustand";

type CatanData = {
    harbors: Map<number, number>;
    materials: Map<
        number,
        {
            num: number;
            material: string;
        }
    >;
    robberArea: number;
    bank: {
        materials: MaterialList;
        devcards: DevcardList;
    };
    client: {
        id?: number;
        socket?: Socket;
    };
    onlines: Map<number, Player>;
    local: Omit<Player, "materials" | "devcards"> & {
        materials: MaterialList;
        devcards: DevcardList;
    };
    turnId: number;
    dices: [number, number];
    ui: {
        mapState: {
            state:
                | "loading"
                | "ready"
                | "picking vertex"
                | "picking area"
                | "picking edge";
            callback: (data: any) => void;
        };
    };
};

type CatanActions = {
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
    };
    setSocket: (socket: Socket) => void;
};

const defaultValue: CatanData = {
    robberArea: -1,
    harbors: new Map(),
    materials: new Map(),
    bank: {
        devcards: [0, 0, 0, 0, 0],
        materials: [0, 0, 0, 0, 0],
    },
    client: {
        id: -1,
    },
    onlines: new Map(),
    local: {
        materials: [0, 0, 0, 0, 0],
        devcards: [0, 0, 0, 0, 0],
        roads: 0,
        victoryPoints: 0,
        color: 0,
        name: "shani",
    },
    turnId: 0,
    dices: [1, 1],
    ui: {
        mapState: {
            state: "loading",
            callback: nonFunction,
        },
    },
};

export type CatanStore = CatanData & CatanActions;

export const useCatanStore = create<CatanStore>((set) => ({
    ...defaultValue,
    set,
    setSocket(socket) {
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
                        mapState: {
                            state: "ready", // point:ready
                            callback: nonFunction,
                        },
                    },
                });
            }
        );

        socket.on(
            ClientCodes.TURN,
            ({ dices }: { dices: [number, number] }) => {
                set({
                    dices: [
                        randIntNot(1, 6, [dices[0]]),
                        randIntNot(1, 6, [dices[1]]),
                    ],
                });

                setTimeout(() => {
                    set({ dices });
                }, 100);
            }
        );

        socket.emit(ServerCodes.INIT, name);

        set({ client: { socket, id: -1 } });
    },
}));
