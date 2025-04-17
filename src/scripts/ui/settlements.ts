import { Point } from "../types/point";

const dotPositions = [
    { x: 75, y: -7.5 },
    { x: 75, y: 157.5 },
    { x: 4, y: 34 },
    { x: 146, y: 34 },
    { x: 4, y: 116 },
    { x: 146, y: 116 },
];

const hexPositions = [
    [0, 0, 0],
    [1, 141.9, 0],
    [2, 283.8, 0],
    [3, -70.95, 123.75],
    [4, 70.95, 123.75],
    [5, 212.85, 123.75],
    [6, 354.75, 123.75],
    [7, -141.9, 247.5],
    [8, 0, 247.5],
    [9, 141.9, 247.5],
    [10, 283.8, 247.5],
    [11, 425.7, 247.5],
    [12, -70.95, 371.25],
    [13, 70.95, 371.25],
    [14, 212.85, 371.25],
    [15, 354.75, 371.25],
    [16, 0, 495],
    [17, 141.9, 495],
    [18, 283.8, 495],
];

let fullDotPositions = hexPositions.flatMap(([, x, z]) => {
    return dotPositions.map((pos) => {
        return { x: x + pos.x, y: pos.y + z };
    });
});

const distance = (a: Point, b: Point) => {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
};

const THRESHOLD = 1;
const uniquePoints: Point[] = [];

for (const point of fullDotPositions) {
    const isDuplicate = uniquePoints.some(
        (existing) => distance(point, existing) < THRESHOLD
    );
    if (!isDuplicate) {
        uniquePoints.push(point);
    }
}

uniquePoints.forEach((value, index) => {
    const fixedNum = 2;
    uniquePoints[index].y = Math.round(value.y / fixedNum) * fixedNum;
});

uniquePoints.sort((a, b) => {
    if (a.y === b.y) {
        return a.x - b.x;
    }
    return a.y - b.y;
});

console.log(JSON.stringify(uniquePoints, null, 4));
