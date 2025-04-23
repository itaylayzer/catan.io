import { convertions } from "@/components/catan/map/configs";
import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { nonFunction } from "@/config/objects/nonFunction";
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
        set({
            ui: {
                events: get().ui.events,
                mapState: get().ui.mapState,
                dicesState: state,
            },
        });
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
                    mapState: {
                        state: "ready", // point:ready
                        callback: nonFunction,
                    },
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
                if (get().turnId === get().local.color) {
                    setTurnState("mine");
                } else {
                    setTurnState("others");
                }
            });
        }
    );

    socket.on(ClientCodes.TURN_SWITCH, (turnId: number) => {
        set({ turnId });
        setTurnState(get().turnId === get().local.color ? "ready" : "others");
    });

    socket.emit(ServerCodes.INIT, name);

    set({ client: { socket, id: -1 } });
}
