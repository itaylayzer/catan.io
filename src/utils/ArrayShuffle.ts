import { RandomIndex } from "./RandomIndex";

export function ArrayShuffle<T>(arr: T[]) {
    for (let index = 0; index < arr.length; index++) {
        const randomIndex = RandomIndex(arr);

        swap(arr, index, randomIndex);
    }
}

function swap<T>(arr: T[], first: number, second: number) {
    const temp = arr[first];
    arr[first] = arr[second];
    arr[second] = temp;
}
