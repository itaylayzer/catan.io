import createServer from "@/server/server";
import { io } from "@/server/sockets";
import { useCatanStore } from "@/store/useCatanStore";
import { TranslateCode } from "@/utils/code";
import { useEffect } from "react";

import CatanGame from "@/components/catan/game/CatanGame";
import Head from "next/head";

export default function PlayPage() {
    const {
        client: { socket },
        setSocket,
    } = useCatanStore();

    useEffect(() => {
        createServer(async ({ code }) => {
            setSocket(await io(TranslateCode(code)));
        });
    }, []);

    const children = socket ? CatanGame() : null;

    return (
        <>
            <Head>
                <title>Catan.io | Play</title>
            </Head>
            {children}
        </>
    );
}
