import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { ServerCodes } from "@/config/constants/codes";
import { ACTION_DECK_BUTTONS } from "@/config/constants/ui";
import { useCatanStore } from "@/store/useCatanStore";

export function ActionDeck() {
    const {
        client: { socket, id },
        turnId,
    } = useCatanStore();

    const actions = [
        () => {
            socket?.emit(ServerCodes.ROLL);
        },
        () => {
            socket;
        },
        () => {
            socket;
        },
        () => {
            socket;
        },
        () => {
            socket;
        },
    ];

    const disabled = [turnId !== id, false, false, false, false];

    return (
        <div>
            <div className="relative z-10 flex flex-row-reverse border-1 rounded-2xl bg-accent gap-5 px-4 pb-1 pt-2 scale-110 items-center justify-around">
                {ACTION_DECK_BUTTONS.map(({ header, icon, count }, index) => {
                    return (
                        <Tooltip key={header}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="hover:animate-pulse cursor-pointer aspect-square hover:scale-125"
                                    onClick={actions[index]}
                                    disabled={disabled[index]}
                                >
                                    {count ? (
                                        <p className="text-xl opacity-65 font-mono font-bold ">
                                            {count}
                                        </p>
                                    ) : null}
                                    {icon({ color: "white", size: 30 })}
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{header}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
