import type { NextConfig } from "next";

// The site is served from the custom domain root, so basePath is empty by
// default. Set NEXT_PUBLIC_BASE_PATH only if it moves under a sub-path.
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
