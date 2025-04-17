import { ReactNode } from "react";
import { BsHexagonFill } from "react-icons/bs";
let delayNumber = 0;
export const hexSize = 150;

export function Hex(
    props: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLDivElement>,
        HTMLDivElement
    > & { color: string; children: ReactNode }
) {
    const { color, children, ...others } = props;
    const padding = 5;

    delayNumber++;

    return (
        <div className="relative " {...others}>
            <div style={{ transition: "translate .1s" }}>
                <div className="absolute z-2 top-[50%] left-[50%] -translate-[50%]">
                    {children}
                </div>
                <BsHexagonFill
                    style={{ translate: `${padding / 2}px ${padding / 2}px` }}
                    className="z-1 absolute"
                    color="var(--sidebar)"
                    size={hexSize - padding}
                    opacity={0.95}
                />
                <BsHexagonFill
                    color={color}
                    size={hexSize}
                    className="absolute"
                    style={{ transition: "filter .1s" }}
                    filter={`drop-shadow(0px ${20}px ${color}5f)`}
                />
                <BsHexagonFill
                    color={color}
                    size={hexSize}
                    className="animate-pulse"
                    style={{ animationDelay: `${delayNumber / 3}s` }}
                    filter={`drop-shadow(0px 0px 25px ${color}7f)`}
                />
            </div>
        </div>
    );
}
