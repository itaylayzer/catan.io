import { Input } from "@/components/ui/input";
import { Message } from "./Message";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedState";

export function Chat(props: React.HTMLAttributes<HTMLDivElement>) {
    const { className, ...rest } = props;

    const containerRef = useRef<HTMLDivElement>(null);
    const [hover, setHover, setImmediateHover] = useDebouncedValue<boolean>(
        1000,
        false
    );
    const fixedClassName = cn(
        className,
        hover ? "opacity-100" : "opacity-0",
        `flex flex max-h-full h-full overflow-hidden`
    );

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
