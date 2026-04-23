import "@/env/server";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  transpilePackages: ["next-mdx-remote"],
  /* config options here */
};

export default nextConfig;
