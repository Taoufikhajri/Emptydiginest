import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Load database drivers from node_modules at runtime instead of bundling them (PGlite ships WASM files).
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
};

export default nextConfig;
