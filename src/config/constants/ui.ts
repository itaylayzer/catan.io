import SVGWood from "@/components/svg/custom/SVGWood";
import SVGBrick from "@/components/svg/custom/SVGBrick";
import SVGOre from "@/components/svg/custom/SVGOre";
import SVGWheet from "@/components/svg/custom/SVGWheet";
import SVGWool from "@/components/svg/custom/SVGWhool";
import SVGMonopoly from "@/components/svg/custom/SVGMonopoly";

import { FaMagic, FaQuestion, FaRoad, FaTrophy, FaCity } from "react-icons/fa";
import { FaHouse, FaChessKnight } from "react-icons/fa6";
import { RiPlantFill } from "react-icons/ri";
import { Fa2Roads } from "@/components/svg/react-icons/Fa2Roads";

export const COLORS = ["#fff", "#3b82f6", "#7f1d1d", "#c2410c"];

export const MATERIALS = [
    { name: "Wood", icon: SVGWood },
    { name: "Wool", icon: SVGWool },
    { name: "Wheat", icon: SVGWheet },
    { name: "Brick", icon: SVGBrick },
    { name: "Ore", icon: SVGOre },
];

export const ONLINE_STATS = [
    { name: "Victory Points", icon: FaTrophy },
    { name: "Materials", icon: FaQuestion },
    { name: "Development Cards", icon: FaMagic },
    { name: "Roads", icon: FaRoad },
];

const DEVELOPMENTS = [
    {
        icon: FaChessKnight,
        name: "Knight",
    },
    ONLINE_STATS[0],
    {
        icon: Fa2Roads,
        name: "2 Roads",
    },
    {
        icon: RiPlantFill,
        name: "2 Year of Plant",
    },
    {
        icon: SVGMonopoly,
        name: "Monopol",
    },
];

export const STORE_ICONS = {
    road: FaRoad,
    settlement: FaHouse,
    city: FaCity,
    devcard: FaMagic,
};

export const TRADE_MATERIALS = [...MATERIALS, ONLINE_STATS[2]];
export const LOCAL_DECK_MATERIALS = [...MATERIALS, ...DEVELOPMENTS];
