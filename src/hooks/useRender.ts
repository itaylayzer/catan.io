import { useState } from "react";

export const useRender = () => {
    const [value, setValue] = useState(0);

    const increase = () => {
        setValue((old) => old + 1);
    };

    return increase;
};
