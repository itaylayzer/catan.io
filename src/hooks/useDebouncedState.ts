import { useEffect, useState } from "react";

export const useDebouncedValue = <T>(ms: number, defaultValue: T) => {
    const [state, setState] = useState<T>(defaultValue);

    const [value, setValue] = useState<T>(defaultValue);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setValue(state);
        }, ms);

        return () => {
            clearTimeout(timeout);
        };
    }, [state]);

    const setImmediate = (value: React.SetStateAction<T>) => {
        setState(value);
        setValue(value);
    };
    return [value, setState, setImmediate] as [
        T,
        React.Dispatch<React.SetStateAction<T>>,
        (value: React.SetStateAction<T>) => void
    ];
};
