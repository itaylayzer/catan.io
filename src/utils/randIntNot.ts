import { randInt } from "three/src/math/MathUtils.js";

export function randIntNot(from: number, to: number, notValues: number[]) {
    let value = randInt(from, to);

    while (notValues.includes(value)) {
        value = randInt(from, to);
    }

    return value;
}
