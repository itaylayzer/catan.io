import SVGBrick from "@/components/svg/custom/SVGBrick";
import SVGOre from "@/components/svg/custom/SVGOre";
import SVGWheet from "@/components/svg/custom/SVGWheet";
import SVGWool from "@/components/svg/custom/SVGWhool";
import SVGWood from "@/components/svg/custom/SVGWood";

export const convertions = {
    matsColors: {
        wood: "#16a34a",
        wool: "#65a30d",
        wheat: "#ca8a04",
        blank: "#404040",
        brick: "#b91c1c",
        ore: "#a8a29e",
    } as Record<string, string>,
    matsNaming: ["wood", "wool", "wheat", "brick", "ore", "blank"],
};
export const matsToIcon: Record<
    string,
    ((props: React.SVGProps<SVGSVGElement>) => JSX.Element) | null
> = {
    wood: SVGWood,
    wool: SVGWool,
    wheat: SVGWheet,
    brick: SVGBrick,
    ore: SVGOre,
    blank: null,
};
