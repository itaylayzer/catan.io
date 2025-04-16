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
            socket.on(ServerCodes.INIT, (name: string) => {
                const id = catan.playerJoin(name, socket);

                socket.emit(ClientCodes.INIT, {...catan.json(), id});
            });

            socket.on(ServerCodes.STATUS, () => {
                socket.emit(ClientCodes.STATUS, catan.playerCount < 4);
            });
        }
    );
}
