import { OG_COLORS, ogImage, SITE_HOST } from "@/components/OgImage";

/** The site's og:image (see ogMetadata in src/lib/og.ts). */

// Required by static export (output: "export") for a route handler.
export const dynamic = "force-static";

export function GET() {
  return ogImage(({ Mascot }) => (
    <>
      <Mascot height={340} />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={{ fontSize: 64, lineHeight: 1.2 }}>スピードキュービちゃん</div>
        <div style={{ fontSize: 40, color: OG_COLORS.muted }}>OLL・PLL の練習ツール</div>
        <div style={{ fontSize: 32, color: OG_COLORS.accent, marginTop: 24 }}>{SITE_HOST}</div>
      </div>
    </>
  ));
}
