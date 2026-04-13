import Peer, { DataConnection, PeerOptions } from "peerjs";
import Config from "../config";
import { decrypt, encrypt } from "./chiper";
import Pako from "pako";
import LobbyRTCClient from "@/lib/LobbyRTCClient";

const peerOptions: PeerOptions = {
    ...LobbyRTCClient.peerSettings(),
    debug: Config.PEER_DEBUG_LEVEL ?? 0,
};

export function io(uri: string, password?: string): Promise<Socket> {
    const promise = LobbyRTCClient.joinLobby(uri, password);
    return new Promise((resolve, reject) => {
        const peer = new Peer(peerOptions);

        // Listen for the 'open' event, which indicates that the Peer connection is open.
        peer.on("open", async (id) => {
            // Once the Peer connection is open, create a data connection.
            const { webRTCId } = await promise;
            const dataConnection = peer.connect(webRTCId, { reliable: true });

            setTimeout(() => {
                reject("the server took too long to respond");
            }, 5000);
            dataConnection.on("open", () => {
                // Create a new Socket instance with the data connection.
                const sock = new Socket(dataConnection);
                sock.id = id;
                // Resolve the Promise with the Socket object.
                resolve(sock);
            });
            dataConnection.on("error", (r) => {
                reject(r.message);
            });
        });

        peer.on("error", (error) => {
            reject(error);
        });
    });
}

// class For Server
export class Socket {
    private client: DataConnection;
    public events: Map<string | number, (args: any) => void>;
    public id: string;
    constructor(_socket: DataConnection) {
        this.id = "";
        this.client = _socket;
        this.events = new Map();

        this.client.on("data", (data) => {
            try {
                const d = JSON.parse(decrypt(data as Pako.Data) as string) as {
                    event: string;
                    args: any;
                };
                const xhandler = this.events.get(d.event);
                if (xhandler !== undefined) {
                    xhandler(d.args);
                }
            } catch { }
        });

        this.client.on("error", (error) => {
            console.error("Data connection error:", error);
        });
        this.client.on("close", () => {
            try {
                const xhandler = this.events.get("disconnect");
                if (xhandler !== undefined) {
                    xhandler("");
                }
            } catch { }
        });
    }

    public middleware(handler: () => void) {
        this.client.on("data", handler);
    }

    public on(
        event_name: string | number | "disconnect",
        handler: (args: any) => void
    ) {
        const oldEvent = this.events.get(event_name);
        if (oldEvent) {
            this.events.set(event_name, (args) => {
                oldEvent(args);
                handler(args);
            });
        } else this.events.set(event_name, handler);
    }
    public emit(event_name: string | number, args?: any) {
        try {
            this.client.send(
                encrypt(
                    JSON.stringify({
                        event: event_name,
                        args: args ?? undefined,
                    })
                )
            );
        } catch { }
    }
    public disconnect() {
        this.emit("disconnect");
        setTimeout(() => {
            this.client.close();
        }, 500);
    }
}

export class Server {
    private socket: Peer;
    public logFunction: (...data: any[]) => void;
    public renderFunction: (v: Array<any[]>) => void;
    public logs: Array<any[]> = [];
    public code: string;
    constructor(
        password: string | undefined,
        visible: boolean,
        idf?: (thisobj: Server) => void,
        onf?: (s: Socket, server: Server) => void
    ) {

        this.code = "waiting";
        this.socket = new Peer(peerOptions);

        this.logFunction = (...data) => {
            this.logs.push(data);
            this.renderFunction(this.logs);
        };
        this.renderFunction = () => { };
        this.socket.on("open", async () => {
            LobbyRTCClient.hostLobby(this.socket.id, password, visible).then((code) => {
                this.code = code;
                idf?.(this);
            })
        });

        this.socket.on("connection", (dataConnection) => {
            dataConnection.on("open", () => {
                const socket = new Socket(dataConnection);
                socket.id = dataConnection.peer;
                onf?.(socket, this);
                socket.on('disconnect', () => {
                    LobbyRTCClient.updatePlayersCount((old) => old - 1);
                });
                LobbyRTCClient.updatePlayersCount((old) => old + 1);
            });
        });

        this.socket.on("disconnected", () => {
            LobbyRTCClient.closeLobbyQuiet();
        })
    }
    public set OnLogs(v: (...data: any[]) => void) {
        this.logFunction = v;
    }

    public RenderLogs(f: (v: Array<any[]>) => void) {
        this.renderFunction = f;
        f(this.logs);
    }
    public stop() {
        LobbyRTCClient.closeLobbyQuiet();
        this.socket.destroy();
    }


}
