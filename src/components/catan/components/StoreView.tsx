import Store from "@/config/data/game/store.json";
import { MatsCountsViewer } from "./MaterialList";
import { MaterialList } from "@/types/materials";
import { STORE_ICONS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

const tips = [
    <>A city replaces an already built settlement.</>,
    <>Usually, you only play 1 development card per turn.</>,
    <>
        Usually, you cannot play a development card on <br /> the turn you buy
        it.
    </>,
];

export function StoreView({ className }: { className?: ClassValue }) {
    return (
        <div className={cn("flex px-10 flex-col rounded-xl p-2", className)}>
            <h1 className="text-2xl text-center font-semibold pb-4 pt-6 font-[Rubik]">
                Building Costs
            </h1>
            <hr />
            {Store.map(({ name, cost }) => {
                const key = name as keyof typeof STORE_ICONS;
                const icon = STORE_ICONS[key];
                return (
                    <>
                        <div className="flex px-3 gap-3 py-4 items-center">
                            {icon({})}
                            <h1 className="font-[Rubik]">
                                {name.toUpperCase()}
                            </h1>
                            <div className="flex-1" />
                            <div className="flex gap-2">
                                <MatsCountsViewer mats={cost as MaterialList} />
                            </div>
                        </div>
                        <hr />
                    </>
                );
            })}
            <ul className="list-disc list-inside px-5 py-5 font-[Geist]">
                {tips.map((tip) => (
                    <li>{tip}</li>
                ))}
            </ul>
        </div>
    );
}
