import { Html, Head, Main, NextScript } from "next/document";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
export default function Document() {
    return (
        <Html lang="en">
            <Head />
            <body className="antialiased dark">
                <TooltipProvider>
                    <Main />
                    <Toaster
                        expand
                        richColors
                        visibleToasts={20}
                        theme="dark"
                    />
                </TooltipProvider>
                <NextScript />
            </body>
        </Html>
    );
}
