import { useEffect, useState } from "react";
import { useCatanStore } from "@/store/useCatanStore";
import { randInt } from "three/src/math/MathUtils.js";
import {
    RiDice1Fill,
    RiDice2Fill,
    RiDice3Fill,
    RiDice4Fill,
    RiDice5Fill,
    RiDice6Fill,
} from "react-icons/ri";

const icons = [
    RiDice1Fill,
    RiDice2Fill,
    RiDice3Fill,
    RiDice4Fill,
    RiDice5Fill,
    RiDice6Fill,
];

function Dice({ num, fired }: { num: number; fired: () => void }) {
    const [fakeNum, setFakeNum] = useState<number>(1);
    const [scaleClass, setScaleClass] = useState("");

    useEffect(() => {
        let timeoutId: number | undefined = undefined;
        const roll = async (seconds: number) => {
            const rand = randInt(1, 6);
            setFakeNum(rand);
            if (seconds < 0) return Promise.resolve(rand);
            else {
                setScaleClass(
                    "scale-80 animate-pulse blur-[2px] opacity-50 transition-none"
                );
                requestAnimationFrame(() => {
                    setScaleClass(
                        "scale-100 transition-transform duration-200 ease-in-out blur-[1px] opacity-100"
                    );
                });
                return new Promise<number>((resolve) => {
                    // @ts-ignore
                    timeoutId = setTimeout(async () => {
                        resolve(await roll(seconds - 100 / (1000 * seconds)));
                    }, 100 / seconds);
                });
            }
        };
        roll(1).then(() => {
            setFakeNum(num);
            setScaleClass("scale-130 transition-none");
            setTimeout(() => {
                fired();
            }, 500);
            requestAnimationFrame(() => {
                setScaleClass(
                    "scale-100 transition-transform duration-500 ease-in-out"
                );
            });
        });

        return () => {
            clearTimeout(timeoutId);
        };
    }, [num]);

    return icons[fakeNum - 1]({
        className: scaleClass,
        size: 50,
    });
}

export default function Dices2D() {
    const {
        dices,
        ui: { events },
    } = useCatanStore();

    const [times, setTimes] = useState(0);

    useEffect(() => {
        setTimes(0);
    }, [dices]);

    useEffect(() => {
        if (times < 2) return;
        events.emit("dices finished");
    }, [times]);

    return (
        <div className="h-15 justify-center flex">
            <Dice
                fired={() => {
                    setTimes((old) => old + 1);
                }}
                num={dices[0]}
            />
            <Dice
                fired={() => {
                    setTimes((old) => old + 1);
                }}
                num={dices[1]}
            />
        </div>
    );
}
