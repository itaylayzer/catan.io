import Catan2DSkeleton from "@/components/catan/map/Catan2DSkeleton";
import SVGWood from "@/components/svg/custom/SVGWood";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { FaDoorOpen, FaKey } from "react-icons/fa";

export default function HomePage() {
    return (
        <>
            <Button
                variant="link"
                onClick={() => {
                    window.open("https://itaylayzer.github.io/", "_blank");
                }}
                className="font-[Rubik] absolute bottom-[1%] z-50 right-[50%] translate-x-[50%] cursor-pointer font-light"
            >
                @itaylayzer
            </Button>
            <div className="absolute z-20 flex flex-col gap-2 justify-center items-start top-0 left-50 w-[30%] h-full">
                <div className="flex gap-2 items-center ">
                    <SVGWood height={80} width={80} fill="#222" />
                    <h1 className="text-8xl font-[Rubik] font-bold">Catan</h1>
                </div>

                <div className="flex gap-2">
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                variant="link"
                                className="cursor-pointer text-xl"
                            >
                                <FaDoorOpen /> host
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex flex-col gap-3">
                                <Input placeholder="enter name"></Input>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer"
                                    >
                                        <FaDoorOpen />
                                        Host
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                    <Popover>
                        <PopoverTrigger>
                            <Button
                                variant="link"
                                className="cursor-pointer text-xl"
                            >
                                <FaKey /> join
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex flex-col gap-3">
                                <Input placeholder="enter name"></Input>
                                <Input placeholder="enter code"></Input>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        className="cursor-pointer"
                                    >
                                        <FaKey /> Join
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
            <div className="z-0 absolute top-0 right-0 h-full w-[70%] overflow-hidden ">
                <div className="top-0 right-0 absolute h-full w-full not-xl:scale-125 min-xl:scale-175 translate-x-100">
                    <Catan2DSkeleton />
                </div>
            </div>{" "}
        </>
    );
}
