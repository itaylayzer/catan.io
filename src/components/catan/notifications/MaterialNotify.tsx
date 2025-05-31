import { cn } from "@/lib/utils";
import { MaterialList } from "@/types/materials";
import { Component, createRef, ReactNode } from "react";
import { MatsCountsViewer } from "../components/MaterialList";

export class MaterialNotify extends Component<
    any,
    { mats: MaterialList; hidden: boolean },
    any
> {
    private static _instance: MaterialNotify | null = null;

    public static get instance() {
        return this._instance!;
    }

    constructor() {
        super({});
        this.state = { ...this.state, mats: [0, 0, 0, 0, 0], hidden: true };
        MaterialNotify._instance = this;
    }

    containerRef = createRef<HTMLDivElement>();

    wake(mats: MaterialList) {
        this.setState((old) => ({ ...old, mats, hidden: false }));
    }

    render(): ReactNode {
        const { hidden, mats } = this.state;
        return (
            <div
                onAnimationEnd={() => {
                    this.setState((old) => ({ ...old, hidden: true }));
                }}
                ref={this.containerRef}
                className={cn(
                    "z-20 absolute left-[50%] -translate-x-[50%] -translate-y-[150%]",
                    hidden && " pointer-events-none"
                )}
                style={{}}
            >
                <div
                    className={cn("opacity-0 flex gap-2")}
                    style={{
                        animation: hidden
                            ? ""
                            : "hop 1.5s cubic-bezier(0,.96,1,1)",
                    }}
                >
                    <MatsCountsViewer colorize shadowed mats={mats} />
                </div>
            </div>
        );
    }
}
