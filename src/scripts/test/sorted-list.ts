class SortedList<T> {
    private list: T[];
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.list = [];
        this.comparator = comparator;
    }

    public insert(value: T): void {
        let low = 0;
        let high = this.list.length;

        while (low < high) {
            const mid = Math.floor((low + high) / 2);
            if (this.comparator(this.list[mid], value) < 0) {
                low = mid + 1;
            } else {
                high = mid;
            }
        }

        this.list.splice(low, 0, value);
    }

    public map<U>(callback: (item: T, index: number, array: T[]) => U): U[] {
        return this.list.map(callback);
    }

    public forEach(
        callback: (item: T, index: number, array: T[]) => void
    ): void {
        this.list.forEach(callback);
    }

    public getItems(): ReadonlyArray<T> {
        return this.list;
    }
}

// Example usage
const sortedList = new SortedList<number>((a, b) => a - b);
for (let index = 0; index < 1000; index++) {
    sortedList.insert(Math.random());
}

console.log(sortedList.getItems()); // [2, 3, 5, 8]

const mapped = sortedList.map((x) => x * 2);
console.log(mapped); // [4, 6, 10, 16]

sortedList.forEach((x) => console.log(x)); // Logs 2, 3, 5, 8
