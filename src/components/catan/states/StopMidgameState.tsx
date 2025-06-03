import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCatanStore } from "@/store/useCatanStore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaAngleLeft } from "react-icons/fa6";
import { StateOverlay } from "./StateOverlay";

export function StopMidgameState() {
    const key = "StopMidgameState";
    const router = useRouter();

    const {
        ui: { events },
    } = useCatanStore();
    const [hidden, setHidden] = useState(true);

    events.on("stop midgame", () => {
        console.log("got here");
        setHidden(false);
        StateOverlay.instance?.show(key);
    });

    useEffect(() => {
        return () => {
            setHidden(true);
            StateOverlay.instance?.hide(key);
        };
    }, []);

    return (
        <div
            className={cn(
                "absolute top-[50%] z-50 left-[50%] -translate-x-[50%] -translate-y-[50%]",
                hidden
                    ? "h-0 opacity-0  pointer-events-none"
                    : "pointer-events-auto"
            )}
        >
            <div
                className="flex justify-center  items-center flex-col"
                style={{
                    animation: hidden ? "" : "show 4s cubic-bezier(0,.96,1,1)",
                }}
            >
                <div className="h-50"></div>
                <h1 className="font-[Rubik] z-60 drop-shadow-2xl/100 font-medium opacity-100 text-5xl">
                    A player left the game
                </h1>

                <div className="h-50 flex flex-col justify-end">
                    <div className="flex -translate-y-15 z-60 justify-center items-center">
                        <Button
                            variant="link"
                            onClick={() => {
                                router.push("/");
                            }}
                            className="cursor-pointer z-60"
                        >
                            <FaAngleLeft /> Return to home page
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
