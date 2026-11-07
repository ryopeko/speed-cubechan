import type { NextConfig } from "next";

// GitHub Pages serves the site under /<repo>/, so the production build
// needs a basePath. Local dev keeps serving from /.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  // Hide the "N" route indicator in dev; errors still show.
  devIndicators: false,
  // cacheComponents / partialPrefetching rely on PPR, which static export
  // does not support.
};

export default nextConfig;
