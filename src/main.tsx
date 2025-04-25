import { createRoot } from "react-dom/client";
import "./index.css";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { StorePage } from "./pages/store.tsx";
import { PlayPage } from "./pages/play.tsx";
import { HomePage } from "./pages/index.tsx";

const router = createBrowserRouter([
    {
        path: "catan.io/",
        element: <HomePage />,
    },
    {
        path: "catan.io/store",
        element: <StorePage />,
    },
    {
        path: "catan.io/play",
        element: <PlayPage />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster expand richColors visibleToasts={20} theme="dark" />
    </TooltipProvider>
);
