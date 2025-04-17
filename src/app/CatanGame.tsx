import { ActionDeck } from "@/components/catan/components/ActionDeck";
import { BankCard } from "@/components/catan/components/BankCard";
import { Chat } from "@/components/catan/components/Chat";
import { LocalPlayerDeck } from "@/components/catan/components/LocalPlayerDeck";
import PlayersBar from "@/components/catan/components/PlayersBar";

import { TradeCard } from "@/components/catan/components/TradeCard";
import Catan2D from "@/components/catan/map/Catan2D";

export function CatanGame() {
    return (
        <div className="flex absolute w-[100%] h-[100%] top-0 left-0">
            <div className="absolute pt-32 h-full">
                <div className="flex flex-col gap-3 px-5 w-[333px] h-full">
                    <h1 className="text-6xl text-center font-bold ">Catan</h1>
                    <a
                        href="https://itaylayzer.github.io/"
                        className="mb-5 font-mono text-center text-muted-foreground -translate-y-4"
                    >
                        @itaylayzer
                    </a>
                    <div className="flex flex-col justify-center mt-5">
                        <TradeCard />
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 items-center">
                <Catan2D />
                <ActionDeck />
                <LocalPlayerDeck />
                <div className="h-5"></div>
            </div>
            <div className="right-0 absolute pt-32 h-full">
                <div className="flex flex-col gap-3 px-5 h-full ">
                    <BankCard />
                    <PlayersBar />
                    <Chat className="flex-1 " />
                </div>
            </div>
        </div>
    );
}
