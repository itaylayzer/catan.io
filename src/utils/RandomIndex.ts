export function RandomIndex<T>(list: T[] | string) {
    return Math.floor(Math.random() * list.length);
}
