import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
    <TooltipProvider>
        <App />
        <Toaster expand richColors visibleToasts={20} theme="dark" />
    </TooltipProvider>
);
