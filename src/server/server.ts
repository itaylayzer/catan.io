import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { Catan } from "./CatanGraph";
import { Server } from "./sockets";

export default function createServer(onOpen?: (server: Server) => void) {
    const catan = new Catan();

    new Server(
        (self) => {
            onOpen?.(self);
        },
        (socket) => {
            let id = -1;
            socket.on(ServerCodes.INIT, (name: string) => {
                id = catan.playerJoin(name, socket);

                socket.emit(ClientCodes.INIT, { ...catan.json(), id });
            });

            socket.on(ServerCodes.STATUS, () => {
                socket.emit(ClientCodes.STATUS, catan.playerCount < 4);
            });

            socket.on(ServerCodes.ROLL, () => {
                socket.emit(ClientCodes.TURN, catan.act_rollDice(id));
            });

            socket.on(ServerCodes.MESSAGE, (message) => {
                catan.sockets.emit(ClientCodes.MESSAGE, {
                    from: id,
                    date: new Date().getTime(),
                    message,
                });
            });
        }
    );
}
