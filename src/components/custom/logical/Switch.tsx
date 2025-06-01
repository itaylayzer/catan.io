import { ReactNode } from "react";

export default function Switch({
    index,
    children,
}: {
    index: number;
    children: ReactNode[];
}) {
    return children[index];
}
