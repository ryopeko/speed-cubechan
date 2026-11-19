import type { Lang } from "./messages";

/*
 * Which language to show. The site is static (GitHub Pages), so the HTML is
 * always built in English; an inline script in <head> (LANG_INIT_SCRIPT)
 * picks the language before the first paint and sets <html lang>, and the
 * client components read it from there (see useLang).
 */

/** Where the language picked with ?lang= or the switcher is kept. */
export const LANG_KEY = "speed-cubechan:lang";

/** Set on <html> while the page waits to be shown in a language other than English. */
export const LANG_PENDING_ATTR = "data-lang-pending";

/**
 * The language to show: ?lang= first, then the one picked before, then the
 * browser's first language (navigator.languages, which follows the same
 * setting as Accept-Language), else English.
 *
 * Self-contained, because LANG_INIT_SCRIPT inlines its source.
 */
export function pickLang(
  query: string | null,
  stored: string | null,
  languages: readonly string[],
): Lang {
  if (query === "en" || query === "ja") return query;
  if (stored === "en" || stored === "ja") return stored;
  const first = (languages[0] || "").toLowerCase();
  return first === "ja" || first.indexOf("ja-") === 0 ? "ja" : "en";
}

/**
 * Runs in <head> before the body is parsed. Saves a ?lang= choice, sets
 * <html lang>, and hides the page until React has re-rendered it in that
 * language (with a timeout in case the scripts fail to load).
 */
export const LANG_INIT_SCRIPT = `(function () {
  try {
    var q = new URLSearchParams(location.search).get("lang");
    var s = null;
    try { s = localStorage.getItem(${JSON.stringify(LANG_KEY)}); } catch (e) {}
    var lang = (${pickLang.toString()})(q, s, navigator.languages || [navigator.language]);
    if (q === lang) { try { localStorage.setItem(${JSON.stringify(LANG_KEY)}, lang); } catch (e) {} }
    var d = document.documentElement;
    d.lang = lang;
    if (lang !== "en") {
      d.setAttribute(${JSON.stringify(LANG_PENDING_ATTR)}, "");
      setTimeout(function () { d.removeAttribute(${JSON.stringify(LANG_PENDING_ATTR)}); }, 2000);
    }
  } catch (e) {}
})();`;
