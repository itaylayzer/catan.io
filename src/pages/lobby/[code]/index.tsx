import SpinnerCircleDemo from "@/components/customized/spinner/spinner-02";
import { Button } from "@/components/ui/button";
import { CatanGame } from "@/pages/play";
import { io } from "@/server/sockets";
import { useCatanStore } from "@/store/useCatanStore";
import { TranslateCode } from "@/utils/code";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function LobbyPage() {
    const router = useRouter();
    const { code } = router.query as Record<string, string>;

    const {
        client: { socket },
        setSocket,
    } = useCatanStore();

    const [err, setError] = useState<any>();

    useEffect(() => {
        if (!code) return;

        (async () => {
            try {
                setSocket(await io(TranslateCode(code)));
            } catch (err) {
                setError(err);
            }
        })();
    }, [code]);

    const children = socket ? CatanGame() : null;

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
                    <h1 className="font-[Rubik]  opacity-100 font-extralight text-5xl">
                        {err}
                    </h1>
                    <br />
                    <Button
                        variant="link"
                        onClick={() => {
                            router.back();
                        }}
                        className="cursor-pointer transition-opacity opacity-50 hover:opacity-80"
                    >
                        {" "}
                        go back to home page
                    </Button>
                </div>
            ) : children ? (
                children
            ) : (
                <div className="absolute top-[50%] left-[50%] flex flex-col gap-2 justify-center items-center -translate-[50%]">
                    <SpinnerCircleDemo />
                </div>
            )}
        </>
    );
}
