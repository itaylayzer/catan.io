const VMath = (list: number[]) => ({
    sameSize: {
        add: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] += val;
            });
        },
        sub: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] -= val;
            });
        },
        mul: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] *= val;
            });
        },
        div: (other: number[]) => {
            other.forEach((val, index) => {
                list[index] /= val;
            });
        },
    },
    numeric: {
        add: (other: number) => {
            list.forEach((_, index) => {
                list[index] += other;
            });
        },
        sub: (other: number) => {
            list.forEach((_, index) => {
                list[index] -= other;
            });
        },
        mul: (other: number) => {
            list.forEach((_, index) => {
                list[index] *= other;
            });
        },
        div: (other: number) => {
            list.forEach((_, index) => {
                list[index] /= other;
            });
        },
    },
    clone() {
        return VMath([...list]);
    },
    get() {
        return list;
    },
});

export default VMath;
