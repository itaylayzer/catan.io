import { cn } from "@/lib/utils";
import { useState } from "react";

export default function CopyButton({
    text,
    className,
    onClick: _,
    ...rest
}: { text: string } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
>) {
    const [toggleText, setToggle] = useState(false);

    const onClick = () => {
        try {
            if (toggleText === true) return;

            navigator.clipboard.writeText(text);

            setToggle(true);

            setTimeout(() => {
                setToggle(false);
            }, 1800);
        } catch (err) {
            console.error("click copybutton err", err);
        }
    };

    return (
        <p
            {...rest}
            className={cn(
                className,
                "select-none",
                toggleText ? "font-light" : "cursor-pointer z-[100]"
            )}
            onClick={onClick}
        >
            {toggleText ? "copied" : text}
        </p>
    );
}
