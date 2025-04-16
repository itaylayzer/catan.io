import SVGWood from "@/components/svg/SVGWood";
import SVGBrick from "@/components/svg/SVGBrick";
import SVGOre from "@/components/svg/SVGOre";
import SVGWheet from "@/components/svg/SVGWheet";
import SVGWool from "@/components/svg/SVGWhool";
import SVGMonopoly from "@/components/svg/SVGMonopoly";

import {
    FaMagic,
    FaQuestion,
    FaRoad,
    FaTrophy,
    FaDiceSix,
    FaCity,
} from "react-icons/fa";
import { FaHouse, FaHandshakeSimple, FaChessKnight } from "react-icons/fa6";
import { RiPlantFill } from "react-icons/ri";

export const COLORS = ["#7f1d1d", "#15803d", "#3b82f6", "#c2410c"];

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
    { name: "Mystery Cards", icon: FaMagic },
    { name: "Roads", icon: FaRoad },
];

export const ACTION_DECK_BUTTONS = [
    {
        icon: FaDiceSix,
        header: "Roll Doce",
    },
    {
        icon: FaRoad,
        header: "Place Road",
        count: 1,
    },
    {
        icon: FaHouse,
        header: "Place House",
        count: 1,
    },
    {
        icon: FaCity,
        header: "Upgrade to City",
        count: 1,
    },
    {
        icon: FaMagic,
        header: "Buy Mistery Card",
    },
    {
        icon: FaHandshakeSimple,
        header: "Trade",
    },
];

const DEVELOPMENTS = [
    {
        icon: FaChessKnight,
        name: "Knight",
    },
    ONLINE_STATS[0],
    {
        icon: FaRoad,
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

export const TRADE_MATERIALS = [...MATERIALS, ONLINE_STATS[2]];
export const LOCAL_DECK_MATERIALS = [...MATERIALS, ...DEVELOPMENTS];
