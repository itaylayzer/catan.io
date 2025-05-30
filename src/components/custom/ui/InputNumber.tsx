import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import { useEffect, useState } from "react";
import { FaAngleUp, FaAngleDown } from "react-icons/fa";

export function InputNumber({
    defaultValue,
    onChange,
    min,
    max,
    paragraphClass,
}: {
    defaultValue?: number;
    onChange?: (value: number) => void;
    min?: number;
    max?: number;
    paragraphClass?: ClassValue;
}) {
    const [value, setValue] = useState(defaultValue ?? 0);

    useEffect(() => {
        onChange?.(value);
    }, [value]);

    return (
        <div className="flex gap-1 items-center">
            <div className="flex flex-col">
                <button
                    className="cursor-pointer"
                    onClick={() => {
                        setValue((old) =>
                            max === undefined ? old + 1 : Math.min(max, old + 1)
                        );
                    }}
                >
                    <FaAngleUp />
                </button>
                <button
                    className="cursor-pointer"
                    onClick={() => {
                        setValue((old) =>
                            min === undefined ? old - 1 : Math.max(min, old - 1)
                        );
                    }}
                >
                    <FaAngleDown />
                </button>
            </div>
            <p
                className={cn(
                    "font-[Rubik] font-medium text-lg",
                    paragraphClass
                )}
            >
                {value}
            </p>
        </div>
    );
}
