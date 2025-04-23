const VMath = (list: number[]) => ({
    sameSize: {
        add: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] += val;
            });
            return VMath([...list]);
        },
        sub: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] -= val;
            });
            return VMath([...list]);
        },
        mul: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] *= val;
            });
            return VMath([...list]);
        },
        div: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] /= val;
            });
            return VMath([...list]);
        },
    },
    numeric: {
        add: (other: number) => {
            list.forEach((_, index) => {
                list[index] += other;
            });
            return VMath([...list]);
        },
        sub: (other: number) => {
            list.forEach((_, index) => {
                list[index] -= other;
            });
            return VMath([...list]);
        },
        mul: (other: number) => {
            list.forEach((_, index) => {
                list[index] *= other;
            });
            return VMath([...list]);
        },
        div: (other: number) => {
            list.forEach((_, index) => {
                list[index] /= other;
            });
            return VMath([...list]);
        },
    },
    countpicks: (picks: number[], scalar: number = 1) => {
        picks.forEach((index) => (list[index] += scalar));
    },
    clone() {
        return VMath([...list]);
    },
    get() {
        return list;
    },
    sum() {
        return list.length === 0
            ? 0
            : list.length === 1
            ? list[0]
            : list.reduce((a, b) => a + b);
    },
    avg() {
        return this.sum() / list.length;
    },
});

export default VMath;
