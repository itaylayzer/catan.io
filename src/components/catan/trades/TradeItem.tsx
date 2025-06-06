import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { COLORS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { LocalPlayer, Player } from "@/types/player";
import { Trade } from "@/types/trade";
import { EventDispatcher } from "@/utils/EventDispatcher";
import { Component, ReactNode } from "react";
import {
    FaHandshakeSimple,
    FaFaceSmile,
    FaHandshakeSimpleSlash,
} from "react-icons/fa6";
import { MatsCountsViewer } from "../components/MaterialList";
import { MaterialList } from "@/types/materials";
import { BiTransfer } from "react-icons/bi";
import { convertions } from "../map/configs";
import { Socket } from "@/server/sockets";
import { ServerCodes } from "@/config/constants/codes";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

type TradeProps = { trade: Trade; onCancel: () => void };
type TradeState = {
    reason: number | undefined;
    local: LocalPlayer;
    onlines: Map<number, Player>;
    events: EventDispatcher;
    socket: Socket | undefined;
    open: boolean;
};

export class TradeItem extends Component<TradeProps, TradeState> {
    private key: string;
    constructor(props: TradeProps) {
        super(props);

        const {
            local,
            onlines,
            ui: { events },
            client: { socket },
        } = useCatanStore.getState();

        this.state = {
            ...this.state,
            reason: undefined,
            local,
            onlines,
            events,
            socket,
            open: false,
        };

        this.key = `cancel trade ${props.trade.id}`;
        events.once(this.key, this.onCancelTradeEvent);

        useCatanStore.subscribe((old) => {
            this.setState((oldState) => ({
                ...oldState,
                local: old.local,
                onlines: old.onlines,
                events: old.ui.events,
                socket: old.client.socket,
            }));
        });
    }

    onCancelTradeEvent = (reason: number) => {
        this.setState((old) => ({ ...old, reason }));
    };

    componentWillUnmount(): void {
        this.state.events.off(this.key, this.onCancelTradeEvent);
    }

    render(): ReactNode {
        const { onCancel, trade } = this.props;
        const { reason, local, onlines, socket, open } = this.state;
        const { from, id, mats, to } = trade;

        if (reason !== undefined) {
            onCancel();
            // setTimeout(() => {
            //     onCancel();
            // }, 0);
        }

        const players = new Map<number, Player | LocalPlayer>([
            [local.color, local],
            ...Array.from(onlines.entries()),
        ]);

        const offerPlayer = players.get(from)!;
        const offeredOnlines = Array.from(to.values()).map(
            (id) => players.get(id)!
        );

        const isLocalTrade = from === local.color;
        const color = COLORS[offerPlayer.color];

        const wantedMaterials = mats.map((value) => Math.max(0, value));
        const offeredMaterials = mats.map((value) => -Math.min(0, value));

        return (
            <Accordion type="single" value={String(open)}>
                <AccordionItem
                    onMouseEnter={() => {
                        this.setState((old) => ({ ...old, open: true }));
                    }}
                    onMouseLeave={() => {
                        this.setState((old) => ({ ...old, open: false }));
                    }}
                    className={cn(
                        "w-full max-w-100 flex flex-col hover:animate-none rounded py-2 outline items-center px-4 gap-1",
                        `outline-[${color}]`
                    )}
                    value="true"
                >
                    <AccordionTrigger className="flex gap-2 w-full items-center">
                        <FaHandshakeSimple color={color} size={30} />
                        <p className="font-[Rubik] font-medium">
                            {offerPlayer.name}
                        </p>
                        <div className="flex-1"></div>
                        <div className="flex justify-center gap-2 items-center">
                            <MatsCountsViewer
                                mats={wantedMaterials as MaterialList}
                            />
                            <BiTransfer />
                            <MatsCountsViewer
                                mats={offeredMaterials as MaterialList}
                            />
                        </div>
                        <div className="flex-1"></div>

                        <div className="flex gap-2">
                            {offeredOnlines.map((player) => (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div className="animate-pulse">
                                            <FaFaceSmile
                                                color={COLORS[player.color]}
                                                size={15}
                                            />
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{player.name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="flex justify-center items-center gap-2">
                        {!isLocalTrade ? (
                            <>
                                <Button
                                    variant="link"
                                    className="cursor-pointer z-20"
                                    onClick={() => {
                                        socket?.emit(
                                            ServerCodes.ACCEPT_TRADE,
                                            id
                                        );
                                    }}
                                >
                                    <FaHandshakeSimple
                                        color={convertions.matsColors.wood}
                                        opacity={0.5}
                                    />{" "}
                                    accept
                                </Button>
                                <Button
                                    variant="link"
                                    className="cursor-pointer z-20"
                                    onClick={() => {
                                        socket?.emit(
                                            ServerCodes.REJECT_TRADE,
                                            id
                                        );

                                        onCancel();
                                    }}
                                >
                                    <FaHandshakeSimpleSlash
                                        color={COLORS[2]}
                                        opacity={0.5}
                                    />
                                    reject
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="link"
                                className="cursor-pointer z-20"
                                onClick={() => {
                                    socket?.emit(ServerCodes.CANCEL_TRADE, id);
                                }}
                            >
                                <FaHandshakeSimpleSlash
                                    color={COLORS[2]}
                                    opacity={0.5}
                                />
                                cancel
                            </Button>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        );
    }
}
