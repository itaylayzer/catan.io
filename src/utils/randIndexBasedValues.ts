import { randInt } from "three/src/math/MathUtils.js";
import VMath from "./VMath";

export function randIndexBasedValues(arr: number[]) {
    const sum = VMath(arr).sum();
    if (sum === 0) return -1;

    let randomValue = randInt(0, sum - 1);
    let index = 0;

    while (index < arr.length) {
        if (randomValue < arr[index]) {
            return index;
        }

        randomValue -= arr[index];
        index++;
    }

    return -1;
}
