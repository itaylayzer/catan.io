import { Html, Head, Main, NextScript } from "next/document";
import { TooltipProvider } from "@/components/ui/tooltip";
export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="icon" href="/icon.png" />
            </Head>
            <body className="antialiased dark">
                <TooltipProvider>
                    <Main />
                   
                </TooltipProvider>
                <NextScript />
            </body>
        </Html>
    );
}
