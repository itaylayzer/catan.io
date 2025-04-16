import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
} from "@/components/ui/tooltip";
import { TRADE_MATERIALS } from "@/config/constants/ui";

const wants = [1, 1, 1, 1, 1, 0];
const gives = [2, 2, 2, 2, 2, 0];

export function TradeCard() {
    return null;
    <Card className="bg-sidebar w-[375px]">
        <CardHeader>
            <CardTitle>Incoming Trade</CardTitle>
            <CardDescription>from Barak</CardDescription>
        </CardHeader>
        <CardContent>
            {Object.entries({ wants, gives }).map(([key, value]) => {
                return (
                    <>
                        <h1>barak {key}:</h1>
                        <div className="flex gap-2 justify-around">
                            {value.map((value, index) => (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <div className="flex gap-1 items-center opacity-65">
                                            <p className="text-lg">{value}</p>
                                            {TRADE_MATERIALS[index].icon({
                                                stroke: "white",
                                                opacity: 0.65,
                                                fill: "white",
                                                width: 20,
                                                height: 20,
                                            })}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{TRADE_MATERIALS[index].name}</p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </>
                );
            })}
        </CardContent>
        <CardFooter className="flex flex-row-reverse gap-2">
            <Button className="cursor-pointer" variant="destructive">
                Agree
            </Button>
            <Button className="cursor-pointer" variant="ghost">
                Disagree
            </Button>
        </CardFooter>
    </Card>;
}
