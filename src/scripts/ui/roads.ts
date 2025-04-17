import Positions from "@/config/data/ui/settlements.json";
import Edges from "@/config/data/game/settlements.json";
import { AREAS } from "@/config/constants/game";

const avg = (...list: number[]) =>
    list.length === 1 ? list[0] : list.reduce((a, b) => a + b) / list.length;

const edges = Edges.map(({ from, to }) => {
    const fromPos = Positions[from - AREAS];
    const toPos = Positions[to - AREAS];

    return {
        middle: {
            x: avg(fromPos.x, fromPos.x),
            y: avg(toPos.y, toPos.y),
        },
        from: {
            ...fromPos,
            index: from,
        },
        to: {
            ...toPos,
            index: to,
        },
    };
});

const uniquePoints: {
    middle: {
        x: number;
        y: number;
    };
    from: {
        index: number;
        x: number;
        y: number;
    };
    to: {
        index: number;
        x: number;
        y: number;
    };
}[] = [];

let found = 0;
for (const point of edges) {
    const isDuplicate = uniquePoints.some(
        (existing) =>
            (point.from.index === existing.to.index &&
                point.to.index === existing.from.index) ||
            (point.from.index === existing.from.index &&
                point.to.index === existing.to.index)
    );
    if (!isDuplicate) {
        uniquePoints.push(point);
    } else {
        found++;
    }
}
console.error("found", found, "duplicates in ", edges.length, "edges");

uniquePoints.forEach((value, index) => {
    const fixedNum = 10;
    uniquePoints[index].middle.y =
        Math.round(value.middle.y / fixedNum) * fixedNum;
});

uniquePoints.sort((a, b) => {
    if (a.middle.y === b.middle.y) {
        return a.middle.x - b.middle.x;
    }
    return a.middle.y - b.middle.y;
});

console.error(uniquePoints.length);

console.log(JSON.stringify(uniquePoints, null, 4));
