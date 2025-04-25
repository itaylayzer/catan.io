import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TooltipProvider } from "./components/ui/tooltip.tsx";
import { Toaster } from "@/components/ui/sonner";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { StorePage } from "./pages/store.tsx";

const router = createBrowserRouter([
    {
        path: "catan.io/",
        element: <App />,
    },
    {
        path: "catan.io/store",
        element: <StorePage />,
    },
]);

createRoot(document.getElementById("root")!).render(
    <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster expand richColors visibleToasts={20} theme="dark" />
    </TooltipProvider>
);
