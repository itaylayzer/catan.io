import { Input } from "@/components/ui/input";
import { messages } from "@/config/objects/messages-list";
import { useDebouncedValue } from "@/hooks/useDebouncedState";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useEffect, useRef } from "react";
import { Message } from "./Message";
import { ClientCodes, ServerCodes } from "@/config/constants/codes";
import { useRender } from "@/hooks/useRender";

export function Chat(props: React.HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props;

    const {
        onlines,
        local,
        client: { socket },
    } = useCatanStore();

    const containerRef = useRef<HTMLDivElement>(null);
    const [hover, setHover, setImmediateHover] = useDebouncedValue<boolean>(
        1000,
        false
    );
    const [hoverInput, setHoverInput, setImmediateHoverInput] =
        useDebouncedValue<boolean>(1000, false);
    const render = useRender();

    useEffect(() => {
        if (!socket) return;
        socket?.on(
            ClientCodes.MESSAGE,
            ({
                message,
                from,
                date,
            }: {
                message: string;
                from: number;
                date: number;
            }) => {
                messages.insert({
                    date: new Date(date),
                    from,
                    message,
                });

                setImmediateHover(true);

                render();
            }
        );
    }, [socket]);

    useEffect(() => {
        const container = containerRef.current!;
        if (!container) return;

        const onMouseLeave = () => {
            setHover(false);
        };
        const onMouseEnter = () => {
            setImmediateHover(true);
        };

        container.addEventListener("mouseleave", onMouseLeave);
        container.addEventListener("mouseenter", onMouseEnter);

        return () => {
            container.removeEventListener("mouseleave", onMouseLeave);
            container.removeEventListener("mouseenter", onMouseEnter);
        };
    }, [containerRef]);

    const fixedClassName = cn(
        className,
        hover || hoverInput ? "opacity-100" : "opacity-0",
        `flex flex max-h-full h-full overflow-hidden`
    );

    return (
        <div
            ref={containerRef}
            className={fixedClassName}
            style={{ transition: "opacity .2s" }}
            {...rest}
        >
            <div
                className={cn("flex flex-col max-w-full w-full overflow-auto")}
                style={{ transition: "translate .2s" }}
            >
                <div className="flex-1 flex flex-col-reverse h-full overflow-auto gap-1 mb-2">
                    {messages.map(({ date, from, message }) => {
                        const name =
                            local.color === from
                                ? local.name
                                : onlines.get(from)!.name;

                        const data = {
                            message,
                            time: date
                                .toLocaleTimeString([], {
                                    minute: "2-digit",
                                    hour: "2-digit",
                                    hour12: false,
                                })
                                .replace(":", ":"),
                            name,
                        };

                        return Message(data);
                    })}
                </div>
                <div className="justify-end mb-10">
                    <Input
                        onFocus={() => {
                            setImmediateHoverInput(true);
                        }}
                        onInput={() => {
                            setImmediateHoverInput(true);
                        }}
                        onBlur={() => {
                            setHoverInput(false);
                        }}
                        onKeyDown={({ key, currentTarget }) => {
                            if (key === "Enter") {
                                socket?.emit(
                                    ServerCodes.MESSAGE,
                                    currentTarget.value
                                );
                                currentTarget.value = "";
                            }
                        }}
                        placeholder="Write something to your friends"
                        className=" focus:outline-0 font-[Rubik] bg-accent"
                    />
                </div>
            </div>
        </div>
    );
}
