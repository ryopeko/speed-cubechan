import CaseThumb, { CASE_THUMB_ASPECT } from "./CaseThumb";
import { OG_COLORS, ogImage, SITE_HOST } from "./OgImage";
import type { Pattern } from "@/data/patterns";
import { type Lang, translate } from "@/i18n/messages";

/*
 * The og:images, one per language: og-image.png (English, the one the pages
 * point to) and og-image.ja.png (Japanese).
 */

/** The site's og:image (see ogMetadata in src/lib/og.ts). */
export function siteOgImage(lang: Lang) {
  return ogImage(({ Mascot }) => (
    <>
      <Mascot height={300} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20, flexShrink: 0, marginLeft: 48 }}>
        <div style={{ fontSize: 64, lineHeight: 1.2 }}>{translate(lang, "site.name")}</div>
        <div style={{ fontSize: 40, color: OG_COLORS.muted }}>{translate(lang, "og.tagline")}</div>
        <div style={{ fontSize: 32, color: OG_COLORS.accent, marginTop: 24 }}>{SITE_HOST}</div>
      </div>
    </>
  ));
}

const THUMB_HEIGHT = 400;

/** A pattern page's og:image: the case drawing and the pattern name. */
export function patternOgImage(pattern: Pattern, lang: Lang) {
  return ogImage(({ Mascot }) => (
    <>
      <CaseThumb pattern={pattern} width={Math.round(THUMB_HEIGHT * CASE_THUMB_ASPECT)} height={THUMB_HEIGHT} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 40, color: OG_COLORS.muted }}>{translate(lang, "og.kind", { kind: pattern.kind })}</div>
        <div style={{ fontSize: 120, lineHeight: 1.1 }}>{pattern.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
          <Mascot height={88} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34 }}>{translate(lang, "site.name")}</div>
            <div style={{ fontSize: 26, color: OG_COLORS.accent }}>{SITE_HOST}</div>
          </div>
        </div>
      </div>
    </>
  ));
}
