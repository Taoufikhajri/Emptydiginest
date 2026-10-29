import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // STATIC_EXPORT=1 writes plain HTML/CSS/JS to out/ for any static host; Docker uses standalone.
  output: process.env.STATIC_EXPORT ? "export" : "standalone",
};

export default nextConfig;
