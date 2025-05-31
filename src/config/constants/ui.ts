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
    {
        name: "Victory Points",
        icon: FaTrophy,
        color: "#fca503",
        shadow: "drop-shadow(0px 0px 5px #fca50366)",
    },
    { name: "Cards", icon: FaQuestion },
    { name: "Knight Used", icon: robberIcon },
    { name: "Max Roads", icon: FaRoad },
];

export const DEVELOPMENTS = [
    {
        icon: robberIcon,
        name: "Move Robber",
        color: "#85387e",
    },
    ONLINE_STATS[0],
    {
        icon: Fa2Roads,
        name: "2 Roads",
        color: "#28b31e",
    },
    {
        icon: RiPlantFill,
        name: "Year of plenty",
        color: "#42f581",
    },
    {
        icon: SVGMonopoly,
        name: "Monopol",
        color: "#0f6922",
    },
];

export const DEVELOPMENTS_DESCRIPTIONS = [
    "Allows the player to move the robber to any hex and steal 1 resource card from an opponent with a settlement or city adjacent to that hex. Played knights remain face up in front of the player. The first player to have 3 knights in play receives the 'Largest Army' special card, worth 2 victory points. This can be claimed by another player who plays more knights.",
    "Grants 1 victory point. These cards are kept hidden until the player reaches 10 victory points on their turn, at which point they may reveal them to win the game. Victory Point cards can be revealed during the turn they are drawn.",
    "Allows the player to immediately place 2 new roads on the board, as if they had built them. This can help in achieving the 'Longest Road' special card.",
    "Allows the player to take any 2 resource cards of their choice from the bank and add them to their hand.",
    "Allows the player to name one type of resource. All other players must give the player all resource cards of that type from their hands.",
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
