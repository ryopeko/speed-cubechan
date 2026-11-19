import { patternOgImage } from "@/components/OgCards";
import { findPattern, PATTERNS } from "@/data/patterns";

// Static export needs the ids here too: this is a separate route from page.tsx.
export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function GET(_req: Request, ctx: RouteContext<"/patterns/[id]/og-image.ja.png">) {
  const { id } = await ctx.params;
  const pattern = findPattern(id);
  if (!pattern) throw new Error(`unknown pattern: ${id}`);
  return patternOgImage(pattern, "ja");
}
