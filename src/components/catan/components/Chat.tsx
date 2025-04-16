import { Input } from "@/components/ui/input";
import { Message } from "./Message";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { IoChatboxEllipsesSharp } from "react-icons/io5";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export function Chat(props: React.HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const [hidden, setHidden] = useState(false);

    const fixedClassName = cn(
        className,
        `flex flex max-h-full h-full overflow-hidden`
    );

    useEffect(() => {
        setHidden(true);
    }, [containerRef]);

    return (
        <div className={fixedClassName} {...rest}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div
                        style={{
                            translate: `${
                                hidden
                                    ? containerRef.current?.clientWidth ?? 0
                                    : 0
                            }px 0px`,
                            transition: "translate .2s",
                        }}
                    >
                        <Button
                            variant="link"
                            className="cursor-pointer animate-pulse"
                            onClick={() => setHidden((old) => !old)}
                        >
                            <IoChatboxEllipsesSharp
                                color="white"
                                opacity={hidden ? 1 : 0.65}
                                style={{ transition: "opacity .2s" }}
                            />
                        </Button>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{hidden ? "show chat" : "hide chat"}</p>
                </TooltipContent>
            </Tooltip>
            <div
                ref={containerRef}
                className={cn(
                    "flex flex-col max-w-full w-full overflow-auto",
                    hidden ? `translate-x-[100%]` : ""
                )}
                style={{ transition: "translate .2s" }}
            >
                <div className="flex-1 flex flex-col-reverse h-full overflow-auto gap-1 mb-2">
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                    <Message name="barak" time="14:05" message="cool" />
                </div>
                <div className="justify-end mb-10">
                    <Input
                        placeholder="Write something to your friends"
                        className="bg-background focus:outline-0"
                    />
                </div>
            </div>
        </div>
    );
}
