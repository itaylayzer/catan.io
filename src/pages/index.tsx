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
import { MdMenuBook } from "react-icons/md";
import { FaFlipboard } from "react-icons/fa6";
import LobbyRTCClient from "@/lib/LobbyRTCClient";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Toaster } from "@/components/ui/sonner";
import {
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogContent,
} from "@/components/ui/dialog";
import { FaUser } from "react-icons/fa";
import { FaMinus } from "react-icons/fa";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/components/ui/input-otp";
import { LobbiesTable } from "@/components/catan/components/LobbiesTable";
import { IoMdEye } from "react-icons/io";

import { cn } from "@/lib/utils";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { hashPassword } from "@/utils/hashPassword";

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

    const [name, setName] = useState(
        `Guest_${Math.floor(Math.random() * 1000)}`,
    );
    const [hostPassword, setHostPassword] = useState<string>();
    const [hostVisible, setHostVisible] = useState<boolean>(true);
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

    const host = async () => {
        updateName();

        var password: string | undefined = undefined;
        if (typeof hostPassword === "string" && hostPassword.trim() !== "") {
            password = await hashPassword(hostPassword);
            sessionStorage.setItem("password", password);
        }

        createServer(
            { password: password, visible: hostVisible },
            async ({ code: serverCode }) => {
                router.push(`/lobby?code=${serverCode}`);
            },
        );
    };

    const quickJoin = async () => {
        try {
            const { token } = await LobbyRTCClient.quickPlay();
            updateName();

            router.push(`/lobby?code=${token}`);
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.status === 404) {
                    console.warn("toast");
                    toast(
                        "No available lobbies for quick play. Please try hosting or joining with a code.",
                    );
                    return;
                }
            }
        }
    };

    useEffect(() => {}, [name]);

    return (
        <>
            <Head>
                <title>Catan.io</title>
            </Head>
            <Toaster position="top-center" />
            <Dialog>
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
                    <div className="flex gap-2 items-center mt-40">
                        <SVGWood height={80} width={80} fill="#222" />
                        <h1 className="text-8xl font-[Rubik] font-bold">
                            Catan
                        </h1>
                    </div>
                    <div className="ml-20 flex gap-2 items-center">
                        <FaMinus color="rgb(255,255,255,25%)" />
                        <FaUser />
                        <Input
                            className="border-0 border-b w-65 rounded "
                            onInput={({ currentTarget: { value } }) =>
                                setName(value)
                            }
                            defaultValue={name}
                            placeholder="Enter Name"
                        ></Input>
                    </div>
                    <div className="flex flex-col items-start gap-2 ml-22.5 mt-10">
                        <Button
                            onClick={quickJoin}
                            variant="link"
                            className="cursor-pointer text-xl hover:translate-x-2"
                        >
                            <FaFlipboard /> Quick Play
                        </Button>

                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    variant="link"
                                    className="cursor-pointer text-xl hover:translate-x-2"
                                >
                                    <FaDoorOpen /> Host
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="flex flex-col gap-3">
                                    <Input
                                        type="password"
                                        className="border-0 border-b w-65 rounded "
                                        onInput={({
                                            currentTarget: { value },
                                        }) => setHostPassword(value)}
                                        defaultValue={hostPassword}
                                        placeholder="Password (Optional)"
                                    />

                                    <div className="flex justify-between">
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Button
                                                    variant="ghost"
                                                    className={cn(
                                                        "cursor-pointer",
                                                        hostVisible
                                                            ? "opacity-100"
                                                            : "opacity-50",
                                                    )}
                                                    onClick={() => {
                                                        setHostVisible(
                                                            (old) => !old,
                                                        );
                                                    }}
                                                >
                                                    <IoMdEye />
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>
                                                    {hostVisible
                                                        ? "Click to Hide Room"
                                                        : "Click to Show Room"}
                                                </p>
                                            </TooltipContent>
                                        </Tooltip>
                                        <Button
                                            onClick={host}
                                            variant="link"
                                            className="cursor-pointer"
                                        >
                                            <FaKey /> Host
                                        </Button>
                                    </div>
                                </div>
                            </PopoverContent>
                        </Popover>
                        <DialogTrigger asChild>
                            <Button
                                variant="link"
                                className="cursor-pointer text-xl hover:translate-x-2"
                            >
                                <MdMenuBook /> Lobbies
                            </Button>
                        </DialogTrigger>

                        <Popover>
                            <PopoverTrigger>
                                <Button
                                    variant="link"
                                    className="cursor-pointer text-xl hover:translate-x-2"
                                >
                                    <FaKey /> Join
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="flex flex-col gap-3">
                                    <InputOTP
                                        id="disabled"
                                        maxLength={6}
                                        onChange={(e) => setCode(e)}
                                        value={code}
                                        placeholder="Enter Code"
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} />
                                            <InputOTPSlot index={1} />
                                            <InputOTPSlot index={2} />
                                        </InputOTPGroup>
                                        <InputOTPSeparator />
                                        <InputOTPGroup>
                                            <InputOTPSlot index={3} />
                                            <InputOTPSlot index={4} />
                                            <InputOTPSlot index={5} />
                                        </InputOTPGroup>
                                    </InputOTP>
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
                <DialogContent className="z-[60]">
                    <DialogHeader>
                        <DialogTitle className="text-center">
                            Available Lobbies
                        </DialogTitle>
                        <LobbiesTable
                            onClickLobby={(code) => {
                                updateName();

                                router.push(`/lobby?code=${code}`);
                            }}
                        />
                    </DialogHeader>
                </DialogContent>
            </Dialog>
        </>
    );
}
