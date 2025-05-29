import { StoreView } from "@/components/catan/components/StoreView";
import Head from "next/head";

export default function StorePage() {
    return (
        <>
            <Head>
                <title>Catan.io | Store</title>
            </Head>
            <div className="flex justify-center items-center absolute top-0 left-0 w-full h-full">
                <StoreView className="outline-1 outline-card p-6" />
            </div>
        </>
    );
}
