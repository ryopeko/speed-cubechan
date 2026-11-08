/** Public URL of the deployed site (GitHub Pages), without a trailing slash. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://speed-cubechan.com"
).replace(/\/$/, "");

/** Absolute URL on the deployed site, e.g. siteUrl("/patterns/oll-1/"). */
export const siteUrl = (path: string) => SITE_URL + path;
