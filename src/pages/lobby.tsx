import CatanGame from "@/components/catan/game/CatanGame";
import CopyButton from "@/components/custom/logical/CopyButton";
import { Switch } from "@/components/custom/logical/Switch";
import SpinnerCircleDemo from "@/components/customized/spinner/spinner-02";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ServerCodes } from "@/config/constants/codes";
import { COLORS } from "@/config/constants/ui";
import { cn } from "@/lib/utils";
import { io } from "@/server/sockets";
import { useCatanStore } from "@/store/useCatanStore";
import { hashPassword } from "@/utils/hashPassword";
import { AxiosError } from "axios";
import Head from "next/head";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { FaKey } from "react-icons/fa";

function LobbyRoom({ code }: { code: string }) {
    const {
        ui: { gameStarted },
        local,
        onlines,
        client: { socket },
    } = useCatanStore();

    const players = [local, ...Array.from(onlines.values())].map(
        ({ color, name, ready }) => ({
            color,
            name,
            ready,
        }),
    );

    const { ready } = local;

    const catanGame = CatanGame();

    return gameStarted ? (
        catanGame
    ) : (
        <div className="absolute left-0 top-0 w-full h-full flex justify-center items-center flex-col gap-1">
            <p className="opacity-70">share this code to invite others</p>
            <CopyButton
                className="text-4xl font-[Rubik] font-medium"
                text={code.substring(0, 3) + "-" + code.substring(3)}
                copyText={code}
            />
            <div className="h-1"></div>

            <div className="flex gap-2">
                {players.map((p) => (
                    <div
                        className={cn(
                            "transition-[background-color] px-5  rounded py-2 text-1xl text-center font-[Rubik] flex items-center flex-col",
                            p.ready ? "text-green-700" : "bg-transparent",
                        )}
                    >
                        {p.name}
                        <div
                            className={`w-10 h-0.5 rounded-full opacity-50`}
                            style={{
                                backgroundColor: COLORS[p.color],
                            }}
                        ></div>
                    </div>
                ))}
            </div>
            <div className="h-5"></div>
            <Button
                variant="link"
                className="cursor-pointer"
                onClick={() => {
                    socket?.emit(ServerCodes.READY);
                }}
            >
                {ready ? "Unready" : "Ready"}
            </Button>
        </div>
    );
}

export default function LobbyPage() {
    const router = useRouter();
    const { set } = useCatanStore();
    const code = useSearchParams().get("code")!;
    const name = useSearchParams().get("name");

    useEffect(() => {
        if (name) {
            set((old) => ({
                local: {
                    ...old.local,
                    name: name,
                },
            }));
        }
    }, [name]);

    const {
        client: { socket },
        ui: { events },
        setSocket,
    } = useCatanStore();

    const [err, setError] = useState<any>();
    const [statusCode, setStatusCode] = useState<number>();

    const join = () => {
        if (!code) return;

        (async () => {
            try {
                const socket = await io(
                    code,
                    sessionStorage.getItem("password") ?? undefined,
                );
                setSocket(socket);

                if (typeof sessionStorage.getItem("password") === "string") {
                    sessionStorage.removeItem("password");
                }

                window.addEventListener("unload", () => {
                    socket.disconnect();
                });
            setError(undefined);
                setStatusCode(undefined);
            } catch (err) {
                console.error(err);
                if (err instanceof AxiosError) {
                    setStatusCode(err.status);
                    setError(err);
                } else {
                    setStatusCode(undefined);
                    setError(err);
                }
            }
        })();
    };

    useEffect(() => {
        join();
    }, [code]);

    events.on("status", (message: string) => {
        setError(message);
    });

    const addPasswordElements = [
        <Input
            key="lobby-password"
            type="password"
            className="border-0 mt-20 border-b w-65 rounded "
            onInput={async ({ currentTarget: { value } }) =>
                sessionStorage.setItem("password", await hashPassword(value))
            }
            placeholder="Lobby Password"
        />,
        <Button
            variant="link"
            onClick={join}
            className="cursor-pointer mb-20 text-xl hover:translate-x-2"
        >
            <FaKey /> Join
        </Button>,
    ];

    return (
        <>
            <Head>
                <title>Catan.io | Lobby</title>
            </Head>

            {err ? (
                <div className="absolute top-[50%] left-[50%] flex flex-col gap-2 justify-center items-center -translate-[50%]">
                    <br />

                    <h1 className="font-[Rubik] text-red-500 opacity-80 font-extralight text-3xl">
                        Error has Occoured
                    </h1>
                    <Switch>
                        <Switch.Case condition={statusCode === 401}>
                            <p className="font-[Rubik]  opacity-100 font-extralight text-5xl">
                                Missing password!
                            </p>
                            {addPasswordElements}
                        </Switch.Case>
                        <Switch.Case condition={statusCode === 403}>
                            <p className="font-[Rubik]  opacity-100 font-extralight text-5xl">
                                Wrong password!
                            </p>
                            {addPasswordElements}
                        </Switch.Case>
                        <Switch.Case condition={statusCode === 404}>
                            <p className="font-[Rubik]  opacity-100 font-extralight text-5xl">
                                Lobby not found!
                            </p>
                        </Switch.Case>
                        <Switch.Case
                            condition={
                                typeof statusCode === "number" &&
                                statusCode >= 500
                            }
                        >
                            <p className="font-[Rubik]  opacity-100 font-extralight text-5xl">
                                Server error!
                            </p>
                        </Switch.Case>
                        <Switch.DefaultCase>
                            <p className="font-[Rubik]  opacity-100 font-extralight text-5xl">
                                {JSON.stringify(err)}
                            </p>
                        </Switch.DefaultCase>
                    </Switch>

                    <br />
                    <Button
                        variant="link"
                        onClick={() => {
                            router.replace("/");
                        }}
                        className="cursor-pointer transition-opacity opacity-50 hover:opacity-80"
                    >
                        {" "}
                        go back to home page
                    </Button>
                </div>
            ) : socket ? (
                <LobbyRoom code={code} />
            ) : (
                <div className="absolute top-[50%] left-[50%] flex flex-col gap-2 justify-center items-center -translate-[50%]">
                    <SpinnerCircleDemo />
                </div>
            )}
        </>
    );
}
