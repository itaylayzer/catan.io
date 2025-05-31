import Settlements from "@/config/data/ui/settlements.json";
import Areas from "@/config/data/ui/areas.json";

const middleArr = Settlements;
const sum = middleArr.reduce(({ x: x1, y: y1 }, { x: x2, y: y2 }) => {
    return {
        x: x1 + x2,
        y: y1 + y2,
    };
});

const middle = {
    x: sum.x / middleArr.length,
    y: sum.y / middleArr.length,
};

type Point = { x: number; y: number };

const prepareHarbor = (firstIndex: number, secondIndex: number) => {
    function getFarPoint(
        p1: Point,
        p2: Point,
        mid: Point,
        distance: number
    ): Point {
        // Calculate the direction vector of the line
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        const originalSlope = dy / dx;

        const perpendicularSlope = -1 / originalSlope;

        const fn = (x: number) => perpendicularSlope * (x - mx) + my;

        // Calculate the two possible points at the given distance
        const candidate1: Point = {
            x: mx + distance,
            y: fn(mx + distance),
        };

        const candidate2: Point = {
            x: mx - distance,
            y: fn(mx - distance),
        };

        // Choose the point farther from the middle point
        const dist1 = Math.sqrt(
            (candidate1.x - mid.x) ** 2 + (candidate1.y - mid.y) ** 2
        );
        const dist2 = Math.sqrt(
            (candidate2.x - mid.x) ** 2 + (candidate2.y - mid.y) ** 2
        );

        return dist1 > dist2 ? candidate1 : candidate2;
    }

    const pointA = Settlements[firstIndex] as Point;
    const pointB = Settlements[secondIndex] as Point;
    const middlePoint = middle as Point;
    const harbor = {
        x: (Settlements[firstIndex].x + Settlements[secondIndex].x) / 2,
        y: (Settlements[firstIndex].y + Settlements[secondIndex].y) / 2,
    };

    return {
        ...getFarPoint(pointA, pointB, middlePoint, 15),
        settlements: [firstIndex, secondIndex],
    };
};

const HARBORS = [
    0, 3, 1, 5, 10, 15, 26, 32, 42, 46, 49, 52, 47, 51, 33, 38, 11, 16,
];

const harbors = [];
for (let index = 0; index < HARBORS.length; index += 2) {
    const [first, second] = [HARBORS[0 + index], HARBORS[1 + index]];

    harbors.push(prepareHarbor(first, second));
}

console.log(JSON.stringify(harbors, null, 4));
