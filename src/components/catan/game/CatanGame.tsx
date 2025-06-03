
import { ActionDeck } from "@/components/catan/components/ActionDeck";
import { BankCard } from "@/components/catan/components/BankCard";
import { Chat } from "@/components/catan/components/Chat";
import { LocalPlayerDeck } from "@/components/catan/components/LocalPlayerDeck";
import PlayersBar from "@/components/catan/components/PlayersBar";
import Dices2D from "@/components/catan/dices/Dices2D";
import Catan2D from "@/components/catan/map/Catan2D";
import { MonopolyStateShow } from "@/components/catan/states/MonopolyShowState";
import { MonopolyState } from "@/components/catan/states/MonopolyState";
import { SevenMatsDropState } from "@/components/catan/states/SevenMatsDropState";
import { StateOverlay } from "@/components/catan/states/StateOverlay";
import { TwoYearOfPlentyState } from "@/components/catan/states/TwoYearOfPlentyState";
import { WinState } from "@/components/catan/states/WinState";
import { Button } from "@/components/ui/button";
import { MdStore } from "react-icons/md";
import { StopMidgameState } from "../states/StopMidgameState";

export default function CatanGame() {
    return (
        <div className="flex absolute w-[100%] h-[100%] top-0 left-0">
            <StateOverlay />
            <MonopolyStateShow />
            <WinState />
            <StopMidgameState />

            <div className="absolute pt-32 h-full">
                <div className="flex flex-col gap-3 px-5 w-[333px] h-full">
                    <h1 className="text-6xl text-center font-bold ">Catan</h1>
                    <a
                        href="https://itaylayzer.github.io/"
                        className="mb-5 font-mono text-center text-muted-foreground -translate-y-4"
                    >
                        @itaylayzer
                    </a>
                    <div className="h-min">
                        <Dices2D />
                    </div>
                    <SevenMatsDropState />
                    <TwoYearOfPlentyState />
                    <MonopolyState />
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-3 items-center">
                <Catan2D />
                <ActionDeck />
                <LocalPlayerDeck />
                <div className="h-5"></div>
            </div>
            <div className="right-0 absolute pt-32 h-full">
                <div className="flex flex-col gap-3 px-5 h-full">
                    <Button
                        onClick={() => {
                            window.open("/catan.io/store", "_blank");
                        }}
                        className="absolute right-7 -translate-y-8 cursor-pointer z-20"
                        variant="link"
                    >
                        <MdStore /> store menu
                    </Button>
                    <BankCard />
                    <PlayersBar />
                    <Chat className="flex-1 " />
                </div>
            </div>
        </div>
    );
}
