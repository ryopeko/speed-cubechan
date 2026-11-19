/** Public URL of the deployed site (GitHub Pages), without a trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://speed-cubechan.com"
).replace(/\/$/, "");

/** Absolute URL on the deployed site, e.g. siteUrl("/patterns/oll-1/"). */
export const siteUrl = (path: string) => SITE_URL + path;

/**
 * Where to share `path` (a page path like "/patterns/oll-1/") in a language.
 * Japanese links go to the share page under /ja/, whose link preview is in
 * Japanese and which forwards to `path` shown in Japanese (src/app/ja/).
 */
export const sharePath = (path: string, lang: "en" | "ja") => (lang === "ja" ? `/ja${path}` : path);
