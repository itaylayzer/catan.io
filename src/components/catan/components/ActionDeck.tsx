import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { ACTION_DECK_BUTTONS } from "@/config/constants/ui";

export function ActionDeck() {
    return (
        <div>
            <div className="relative z-10 flex flex-row-reverse border-1 rounded-2xl bg-accent gap-5 px-4 pb-1 pt-2 scale-110 items-center justify-around">
                {ACTION_DECK_BUTTONS.map(({ header, icon, count }) => {
                    return (
                        <Tooltip key={header}>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="hover:animate-pulse cursor-pointer aspect-square hover:scale-125"
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
