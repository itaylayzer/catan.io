import Catan2DSkeleton from "@/components/catan/map/Catan2DSkeleton";
import SVGWood from "@/components/svg/custom/SVGWood";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import createServer from "@/server/server";
import { useCatanStore } from "@/store/useCatanStore";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { FaDoorOpen, FaKey } from "react-icons/fa";

const inputClassName: string = "border-0 border-b rounded-none  ";

export default function HomePage() {
    const router = useRouter();
    const {
        set,
        resetToDefaults,
        client: { socket },
    } = useCatanStore();

    useEffect(() => {
        if (socket) {
            socket.disconnect();
        }
        resetToDefaults();
    }, []);

    const [name, setName] = useState("");
    const [code, setCode] = useState("");

    const updateName = () =>
        set((old) => ({
            local: {
                ...old.local,
                name,
            },
        }));

    const join = () => {
        updateName();

        router.push(`/lobby?code=${code}`);
    };
    const host = () => {
        updateName();

        createServer(async ({ code: serverCode }) => {
            router.push(`/lobby?code=${serverCode}`);
        });
    };

    useEffect(() => {}, [name]);

    return (
        <>
            <Head>
                <title>Catan.io</title>
            </Head>
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
                                <FaDoorOpen /> Host
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="border-0">
                            <div className="flex flex-col gap-3">
                                <Input
                                    className={inputClassName}
                                    onInput={({ currentTarget: { value } }) =>
                                        setName(value)
                                    }
                                    defaultValue={name}
                                    placeholder="Enter Name"
                                ></Input>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={host}
                                        variant="link"
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
                                <FaKey /> Join
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="border-0">
                            <div className="flex flex-col gap-3">
                                <Input
                                    className={inputClassName}
                                    onInput={({ currentTarget: { value } }) =>
                                        setName(value)
                                    }
                                    defaultValue={name}
                                    placeholder="Enter Name"
                                ></Input>
                                <Input
                                    className={inputClassName}
                                    onInput={({ currentTarget: { value } }) =>
                                        setCode(value)
                                    }
                                    defaultValue={code}
                                    placeholder="Enter Code"
                                ></Input>
                                <div className="flex justify-end">
                                    <Button
                                        onClick={join}
                                        variant="link"
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
