import SVGBrick from "@/components/svg/custom/SVGBrick";
import SVGMonopoly from "@/components/svg/custom/SVGMonopoly";
import SVGOre from "@/components/svg/custom/SVGOre";
import SVGWheet from "@/components/svg/custom/SVGWheet";
import SVGWool from "@/components/svg/custom/SVGWhool";
import SVGWood from "@/components/svg/custom/SVGWood";

import { Fa2Roads } from "@/components/svg/react-icons/Fa2Roads";
import {
    FaCity,
    FaInfinity,
    FaMagic,
    FaQuestion,
    FaRoad,
    FaTrophy,
} from "react-icons/fa";
import { FaChessKnight, FaHouse } from "react-icons/fa6";
import { RiPlantFill } from "react-icons/ri";
export const COLORS = ["#ffffff", "#3b82f6", "#e34653", "#c2410c"];

export const MATERIALS = [
    { name: "Wood", icon: SVGWood },
    { name: "Wool", icon: SVGWool },
    { name: "Wheat", icon: SVGWheet },
    { name: "Brick", icon: SVGBrick },
    { name: "Ore", icon: SVGOre },
];

export const HARBOR_ICONS = [
    ...MATERIALS,
    {
        name: "General",
        icon: FaInfinity,
    },
];

const robberIcon = FaChessKnight;

export const ONLINE_STATS = [
    { name: "Victory Points", icon: FaTrophy },
    { name: "Cards", icon: FaQuestion },
    { name: "Knight Used", icon: robberIcon },
    { name: "Max Roads", icon: FaRoad },
];

export const DEVELOPMENTS = [
    {
        icon: robberIcon,
        name: "Move Robber",
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

export const BANK_STATS = [
    { name: "Materials", icon: ONLINE_STATS[1].icon },
    { name: "Development Cards", icon: STORE_ICONS.devcard },
];

export const TRADE_MATERIALS = [...MATERIALS, ONLINE_STATS[2]];
export const LOCAL_DECK_MATERIALS = [...MATERIALS, ...DEVELOPMENTS];
