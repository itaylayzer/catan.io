export interface Trade {
    id: number;
    to: Set<number>;
    from: number;
    mats: number[];
}
