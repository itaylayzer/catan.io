import createServer from "./server/server";
import { useEffect } from "react";
import { io } from "./server/sockets";
import { CatanGame } from "./app/CatanGame";
import { TranslateCode } from "./utils/code";
import { useCatanStore } from "./store/useCatanStore";

function App() {
    const {
        client: { socket },
        set,
    } = useCatanStore();
    useEffect(() => {
        createServer(async ({ code }) => {
            console.log("opend server on code: ", code);
            set({
                client: {
                    id: -1,
                    name: "shifra",
                    socket: await io(TranslateCode(code)),
                },
            });
        });
    }, []);

    return socket ? CatanGame() : null;
}

export default App;
