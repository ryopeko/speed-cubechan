import type { Metadata } from "next";
import { type Lang, translate } from "@/i18n/messages";

/*
 * og:image metadata. The images themselves are route handlers named
 * og-image.png (src/app/**\/og-image.png/route.tsx), so the static export
 * writes real .png files and GitHub Pages serves them as image/png.
 * og-image.ja.png next to each is the Japanese version, used by the
 * Japanese share pages under /ja/ (src/app/ja/).
 */

export const OG_SIZE = { width: 1200, height: 630 };

/** Open Graph / X card metadata for a page whose image is at `imagePath`. */
export function ogMetadata(
  imagePath: string,
  alt: string,
  lang: Lang = "en",
): Pick<Metadata, "openGraph" | "twitter"> {
  const image = { url: imagePath, ...OG_SIZE, alt, type: "image/png" };
  return {
    // Next replaces (not merges) these objects per page, so repeat everything.
    openGraph: {
      siteName: translate(lang, "site.name"),
      type: "website",
      locale: lang === "ja" ? "ja_JP" : "en_US",
      images: [image],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}
