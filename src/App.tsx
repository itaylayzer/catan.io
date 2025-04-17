import createServer from "./server/server";
import { useEffect } from "react";
import { io } from "./server/sockets";
import { CatanGame } from "./app/CatanGame";
import { TranslateCode } from "./utils/code";
import { useCatanStore } from "./store/useCatanStore";

function App() {
    const {
        client: { socket },
        setSocket,
    } = useCatanStore();
    useEffect(() => {
        createServer(async ({ code }) => {
            setSocket(await io(TranslateCode(code)));
        });
    }, []);

    return socket ? CatanGame() : null;
}

export default App;
