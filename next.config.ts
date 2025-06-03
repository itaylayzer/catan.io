import type { NextConfig } from "next";

const isExporting = (process.env.NEXT_EXPORT ?? "0") == "1";

const distDir = isExporting ? "docs" : "out";
const basePath = isExporting ? "/catan.io" : undefined;

const nextConfig: NextConfig = {
    reactStrictMode: false,

    output: "export",
    distDir,
    basePath,
};

export default nextConfig;
