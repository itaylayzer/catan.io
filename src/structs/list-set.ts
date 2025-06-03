export class ListSet<T> {
    private set: Set<T>;
    constructor(
        defaultValues?: Array<T>,
        private compareFn?: ((a: T, b: T) => number) | undefined
    ) {
        this.set = new Set(defaultValues);
    }
    public get add() {
        return this.set.add.bind(this.set);
    }
    public pop(): T | undefined {
        if (this.set.size === 0) return undefined;
        const values = Array.from(this.set.values()).sort(this.compareFn);

        const value = values.pop();

        this.set = new Set(values);
        return value;
    }
}
