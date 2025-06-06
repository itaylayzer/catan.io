import { cn } from "@/lib/utils";
import { Component, ReactNode } from "react";

export class StateOverlay extends Component<{}, { hiddenSet: Set<string> }> {
    private static _instance: StateOverlay | null = null;

    public static get instance(): StateOverlay {
        return this._instance!;
    }

    constructor() {
        super({});

        StateOverlay._instance = this;
        this.state = { ...this.state, hiddenSet: new Set() };
    }

    hide = (key: string) => {
        const set = new Set(this.state.hiddenSet);
        set.delete(key);
        this.setState((old) => ({ ...old, hiddenSet: set }));
    };

    show = (key: string) => {
        const set = new Set(this.state.hiddenSet);
        set.add(key);
        this.setState((old) => ({ ...old, hiddenSet: set }));
    };

    render(): ReactNode {
        return (
            <div
                className={cn(
                    "z-40 top-0 left-0 h-full w-full absolute bg-black/50",
                    this.state.hiddenSet.size === 0 && "hidden"
                )}
            ></div>
        );
    }
}
