import { ReactNode } from "react";

export default function SwitchIndex({
    index,
    children,
}: {
    index: number;
    children: ReactNode[];
}) {
    return children[index];
}
