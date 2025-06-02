import Switch from "@/components/custom/logical/Switch";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ServerCodes } from "@/config/constants/codes";
import { MATERIALS } from "@/config/constants/ui";
import { useCatanStore } from "@/store/useCatanStore";
import { Deal } from "@/types/deal";
import { ReactNode, useRef, useState } from "react";
import { BiTransfer } from "react-icons/bi";
import { FaAngleLeft, FaHandshakeSimple } from "react-icons/fa6";
import { convertions } from "../map/configs";
import SpinnerCircleDemo from "@/components/customized/spinner/spinner-02";

function RenderMaterial(matIndex: number, matCount: number) {
    try {
        const { name, icon } = MATERIALS[matIndex];
        const color = convertions.matsColors[name.toLowerCase()];

        const arr = [];

        for (let i = 0; i < matCount; i++) {
            arr.push(
                icon({
                    height: 30,
                    width: 30,
                    fill: color,
                    stroke: color,
                })
            );
        }

        return arr;
    } catch {
        return [];
    }
}

function StateCarosul({ trades }: { trades: Deal[] }) {
    const {
        ui: { events },
    } = useCatanStore();

    const [offer, setOffer] = useState<number>();
    const [deal, setDeal] = useState<number>();
    const [wanted, setWanted] = useState<number>();

    const offerArr = [0, 0, 0, 0, 0];
    const dealArr = trades
        .filter((t) => t.from === offer)
        .map((v) => v.count)
        .sort();

    trades.forEach(({ from }) => {
        offerArr[from] = 1;
    });

    const confirm = () => {
        events.emit("trade submit", { from: offer, count: deal, to: wanted });
    };

    const index =
        +(deal !== undefined) +
        +(wanted !== undefined) +
        +(offer !== undefined);

    const goBackButton = (onclick: () => void) => (
        <button
            className="hover:underline cursor-pointer -translate-y-[1px]"
            onClick={onclick}
        >
            <FaAngleLeft size={15} color="white" />
        </button>
    );

    return (
        <>
            <div className="flex gap-2 items-center -translate-y-2 opacity-70">
                <Switch index={index}>
                    <>
                        <p>Pick Offer</p>
                    </>
                    <>
                        {goBackButton(() => {
                            setOffer(undefined);
                        })}

                        <p>Pick Deal</p>
                    </>
                    <>
                        {goBackButton(() => {
                            setDeal(undefined);
                        })}
                        <p>Pick Wanted</p>
                    </>
                    <>
                        {goBackButton(() => {
                            setWanted(undefined);
                        })}
                        <p>Confirm</p>
                    </>
                </Switch>
            </div>
            <Switch
                index={
                    +(deal !== undefined) +
                    +(wanted !== undefined) +
                    +(offer !== undefined)
                }
            >
                <div className="flex gap-5">
                    {offerArr.map((count, index) =>
                        count === 0 ? null : (
                            <div
                                className="flex gap-2 hover:scale-90 transition-[opacity,scale] hover:opacity-75 cursor-pointer"
                                onClick={() => {
                                    setOffer(index);
                                }}
                            >
                                {" "}
                                {RenderMaterial(index, count)}{" "}
                            </div>
                        )
                    )}
                </div>
                <div className="flex flex-col items-center gap-5">
                    {dealArr.map((count) => (
                        <div
                            className="flex gap-2 hover:scale-90 transition-[opacity,scale] hover:opacity-75 cursor-pointer"
                            onClick={() => {
                                setDeal(count);
                            }}
                        >
                            {RenderMaterial(offer!, count)}
                        </div>
                    ))}
                </div>
                <div className="flex gap-5">
                    {[1, 1, 1, 1, 1].map((count, index) => (
                        <div
                            className="flex gap-2 hover:scale-90 transition-[opacity,scale] hover:opacity-75 cursor-pointer"
                            onClick={() => {
                                setWanted(index);
                            }}
                        >
                            {" "}
                            {RenderMaterial(index, count)}{" "}
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2 hover:scale-90 transition-[opacity,scale] hover:opacity-75 cursor-pointer">
                    <div onClick={confirm} className="flex gap-5 items-center">
                        <div className="flex gap-2">
                            {RenderMaterial(offer!, deal!)}
                        </div>
                        <BiTransfer />
                        <div className="flex gap-2">
                            {RenderMaterial(wanted!, 1)}
                        </div>
                    </div>
                </div>
            </Switch>
        </>
    );
}

export function TradeButton(): {
    parent: (children: ReactNode, disabled: boolean) => ReactNode;
} {
    const {
        ui: { events },
        client: { socket },
    } = useCatanStore();
    const [trades, setTrades] = useState<Deal[]>();

    const buttonRef = useRef<HTMLButtonElement>(null);
    const togglePop = () => {
        try {
            buttonRef.current!.click();
        } catch {}
    };

    events.on("trade requests", (trades: Deal[]) => {
        trades.sort((a, b) => a.count - b.count);
        console.log("trades.trades", trades);
        setTrades(trades);
    });

    const parent = (children: ReactNode, disabled: boolean): ReactNode => (
        <Popover
            onOpenChange={(open) => {
                if (open === true) {
                    setTrades(undefined);

                    events.once(
                        "trade submit",
                        ({ from, to, count }: Record<string, number>) => {
                            socket?.emit(ServerCodes.APPLY_TRADE, {
                                from,
                                to,
                                count,
                            });
                            togglePop();
                        }
                    );
                }
            }}
        >
            <PopoverTrigger asChild>
                <button disabled={disabled} ref={buttonRef}>
                    {children}
                </button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col justify-center items-center gap-2">
                <h1 className="font-medium text-xl font-[Rubik] text-center">
                    Trades
                </h1>
                {trades === undefined ? (
                    <SpinnerCircleDemo />
                ) : (
                    <StateCarosul trades={trades!} />
                )}
                <Button variant="link" className="cursor-pointer">
                    {FaHandshakeSimple({})} Offer a Trade
                </Button>
            </PopoverContent>
        </Popover>
    );

    return { parent };
}
