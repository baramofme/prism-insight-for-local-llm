import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // PGlite ships a WASM runtime + virtual-FS data file resolved relative to
  // its own package files. If Turbopack bundles it, those asset paths become
  // non-file bundler URLs that Node fs rejects (ERR_INVALID_ARG_TYPE
  // "Received an instance of URL"). Keep it external so it's required straight
  // from node_modules with intact asset resolution.
  serverExternalPackages: ["@electric-sql/pglite"],
};

export default nextConfig;
