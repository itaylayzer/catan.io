import { StoreView } from "@/components/catan/components/StoreView";

export function StorePage() {
    return (
        <div className="flex justify-center items-center absolute top-0 left-0 w-full h-full">
            <StoreView className="outline-1 outline-card p-6" />
        </div>
    );
}
