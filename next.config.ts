import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    reactStrictMode: true,
    basePath: "/catan.io",
    output: "export",
    trailingSlash: true,
};

export default nextConfig;
