import { DependencyList, useEffect } from "react";
import { useRender } from "./useRender";

export const useDependencies = (dependencies: DependencyList) => {
    const render = useRender();

    useEffect(render, dependencies);
};
