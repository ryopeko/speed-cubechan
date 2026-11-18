import type { Metadata } from "next";

/*
 * og:image metadata. The images themselves are route handlers named
 * og-image.png (src/app/**\/og-image.png/route.tsx), so the static export
 * writes real .png files and GitHub Pages serves them as image/png.
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** Open Graph / X card metadata for a page whose image is at `imagePath`. */
export function ogMetadata(imagePath: string, alt: string): Pick<Metadata, "openGraph" | "twitter"> {
  const image = { url: imagePath, ...OG_SIZE, alt, type: "image/png" };
  return {
    // Next replaces (not merges) these objects per page, so repeat everything.
    openGraph: { siteName: "スピードキュービちゃん", type: "website", locale: "ja_JP", images: [image] },
    twitter: { card: "summary_large_image", images: [image] },
  };
}
