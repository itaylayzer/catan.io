import { Socket } from "./sockets";

export class Lobby {
    public clients: Set<Socket>;
    public readies: Map<Socket, boolean>;
    public ready = false;
    constructor() {
        this.readies = new Map();
        this.clients = new Set();
    }

    public join(socket: Socket) {
        this.clients.add(socket);
        this.readies.set(socket, false);
    }

    public toggleReady(socket: Socket) {
        const old = this.readies.get(socket) ?? false;
        this.readies.set(socket, !old);

        // update ready state
        this.ready = Array.from(this.readies.values()).every(
            (ready) => ready === true
        );

        return !old;
    }

    public has(socket: Socket) {
        return this.clients.has(socket);
    }

    public disconnect(socket: Socket) {
        this.readies.delete(socket);
        this.clients.delete(socket);
    }

    public get sockets() {
        return {
            emit: (eventName: string | number, args?: any) => {
                this.clients.forEach((socket) => socket.emit(eventName, args));
            },
            emitExcept: (
                except: Socket,
                eventName: string | number,
                args?: any
            ) => {
                this.clients.forEach(
                    (socket) =>
                        socket !== except && socket.emit(eventName, args)
                );
            },
        };
    }

    public get size() {
        return this.clients.size;
    }
}
