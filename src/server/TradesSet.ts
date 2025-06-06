import { ClientCodes } from "@/config/constants/codes";
import { Player } from "./Player";

interface Trade {
    id: number;
    players: Map<number, Player>;
    from: Player;
    mats: number[];
}

export class TradesSet {
    private trades: Map<number, Trade>;
    private static nextId = 0;

    constructor() {
        this.trades = new Map();
    }

    public add(from: Player, to: Player[], mats: number[]) {
        const id = TradesSet.nextId++;

        const trade: Trade = {
            from,
            players: new Map(to.map((player) => [player.id, player])),
            id,
            mats,
        };

        this.trades.set(id, trade);

        const players = [trade.from, ...Array.from(trade.players.values())];

        players.forEach((player) =>
            player.socket.emit(ClientCodes.OFFER_TRADE, {
                id,
                to: to.map((player) => player.id),
                from: from.id,
                mats,
            })
        );
    }

    public accept(id: number, to: Player) {
        const trade = this.trades.get(id);

        if (trade === undefined || !trade.players.has(to.id)) return false;
        trade.from.socket.emit(ClientCodes.CANCEL_TRADE, {
            id,
            reason: 0,
        });

        to.socket.emit(ClientCodes.CANCEL_TRADE, {
            id,
            reason: 0,
        });

        Array.from(trade.players.values())
            .filter((player) => ![trade.from.id, to.id].includes(player.id))
            .forEach((player) => {
                player.socket.emit(ClientCodes.CANCEL_TRADE, {
                    id,
                    reason: 0,
                });
            });

        this.trades.delete(id);
        const { from, mats } = trade;

        return { from, mats };
    }

    public reject(id: number, to: Player) {
        const trade = this.trades.get(id);

        if (trade === undefined || !trade.players.has(to.id)) return false;
        trade.players.delete(to.id);

        if (trade.players.size === 0) {
            this.trades.delete(id);

            trade.from.socket.emit(ClientCodes.CANCEL_TRADE, {
                id,
                reason: 1,
            });
        } else {
            const players = [trade.from, ...Array.from(trade.players.values())];

            players.forEach((player) =>
                player.socket.emit(ClientCodes.UPDATE_TRADE, {
                    id,
                    players: Array.from(trade.players.keys()),
                })
            );
        }
    }

    public cancel(id: number, from: Player) {
        const trade = this.trades.get(id);
        if (trade === undefined || trade.from.id !== from.id) return;

        this.trades.delete(id);
        const players = [trade.from, ...Array.from(trade.players.values())];

        players.forEach((player) =>
            player.socket.emit(ClientCodes.CANCEL_TRADE, {
                id,
                reason: 2,
            })
        );
    }
}
