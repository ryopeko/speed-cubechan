import CaseThumb, { CASE_THUMB_ASPECT } from "@/components/CaseThumb";
import { OG_COLORS, ogImage, SITE_HOST } from "@/components/OgImage";
import { findPattern, PATTERNS } from "@/data/patterns";

/** A pattern page's og:image: the case drawing and the pattern name. */

// Static export needs the ids here too: this is a separate route from page.tsx.
export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

const THUMB_HEIGHT = 400;

export async function GET(_req: Request, ctx: RouteContext<"/patterns/[id]/og-image.png">) {
  const { id } = await ctx.params;
  const pattern = findPattern(id);
  if (!pattern) throw new Error(`unknown pattern: ${id}`);

  return ogImage(({ Mascot }) => (
    <>
      <CaseThumb pattern={pattern} width={Math.round(THUMB_HEIGHT * CASE_THUMB_ASPECT)} height={THUMB_HEIGHT} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ fontSize: 40, color: OG_COLORS.muted }}>{`${pattern.kind} の練習`}</div>
        <div style={{ fontSize: 120, lineHeight: 1.1 }}>{pattern.name}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 40 }}>
          <Mascot height={88} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 34 }}>スピードキュービちゃん</div>
            <div style={{ fontSize: 26, color: OG_COLORS.accent }}>{SITE_HOST}</div>
          </div>
        </div>
      </div>
    </>
  ));
}
