class AVLNode<T> {
    public value: T;
    public height: number;
    public left: AVLNode<T> | null;
    public right: AVLNode<T> | null;

    constructor(value: T) {
        this.value = value;
        this.height = 1;
        this.left = null;
        this.right = null;
    }
}

class SortedList<T> {
    private root: AVLNode<T> | null;
    private comparator: (a: T, b: T) => number;

    constructor(comparator: (a: T, b: T) => number) {
        this.root = null;
        this.comparator = comparator;
    }

    private height(node: AVLNode<T> | null): number {
        return node ? node.height : 0;
    }

    private rotateRight(y: AVLNode<T>): AVLNode<T> {
        const x = y.left!;
        const T2 = x.right;

        x.right = y;
        y.left = T2;

        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;
        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;

        return x;
    }

    private rotateLeft(x: AVLNode<T>): AVLNode<T> {
        const y = x.right!;
        const T2 = y.left;

        y.left = x;
        x.right = T2;

        x.height = Math.max(this.height(x.left), this.height(x.right)) + 1;
        y.height = Math.max(this.height(y.left), this.height(y.right)) + 1;

        return y;
    }

    private balanceFactor(node: AVLNode<T>): number {
        return this.height(node.left) - this.height(node.right);
    }

    private insertNode(node: AVLNode<T> | null, value: T): AVLNode<T> {
        if (!node) {
            return new AVLNode(value);
        }

        if (this.comparator(value, node.value) < 0) {
            node.left = this.insertNode(node.left, value);
        } else {
            node.right = this.insertNode(node.right, value);
        }

        node.height =
            Math.max(this.height(node.left), this.height(node.right)) + 1;

        const balance = this.balanceFactor(node);

        if (balance > 1 && this.comparator(value, node.left!.value) < 0) {
            return this.rotateRight(node);
        }

        if (balance < -1 && this.comparator(value, node.right!.value) > 0) {
            return this.rotateLeft(node);
        }

        if (balance > 1 && this.comparator(value, node.left!.value) > 0) {
            node.left = this.rotateLeft(node.left!);
            return this.rotateRight(node);
        }

        if (balance < -1 && this.comparator(value, node.right!.value) < 0) {
            node.right = this.rotateRight(node.right!);
            return this.rotateLeft(node);
        }

        return node;
    }

    public insert(value: T): void {
        this.root = this.insertNode(this.root, value);
    }

    private inOrderTraversal(
        node: AVLNode<T> | null,
        callback: (value: T) => void
    ): void {
        if (node) {
            this.inOrderTraversal(node.left, callback);
            callback(node.value);
            this.inOrderTraversal(node.right, callback);
        }
    }

    public map<U>(callback: (item: T, index: number, array: T[]) => U): U[] {
        const result: U[] = [];
        const temp: T[] = [];
        this.inOrderTraversal(this.root, (value) => temp.push(value));
        temp.forEach((value, index) =>
            result.push(callback(value, index, temp))
        );
        return result;
    }

    public forEach(
        callback: (item: T, index: number, array: T[]) => void
    ): void {
        const temp: T[] = [];
        this.inOrderTraversal(this.root, (value) => temp.push(value));
        temp.forEach(callback);
    }

    public getItems(): ReadonlyArray<T> {
        const result: T[] = [];
        this.inOrderTraversal(this.root, (value) => result.push(value));
        return result;
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
