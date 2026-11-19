import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_SIZE } from "@/lib/og";
import { SITE_URL } from "@/lib/site";

/*
 * Shared parts of the og:image routes (src/app/**\/og-image.png/route.tsx).
 * They are rendered once at build time by ImageResponse (Satori), which only
 * understands inline styles and flexbox, so no Tailwind classes here.
 */

// Match the light palette in globals.css.
export const OG_COLORS = {
  bg: "#f5f3ee",
  ink: "#23211d",
  muted: "#77736a",
  accent: "#1e6fe0",
};

// --color-cube-* in globals.css.
const FACE_COLORS = ["#d6122d", "#ff7612", "#f3ec18", "#22cf4b", "#1e6fe0", "#efece4"];

const asset = (path: string) => readFile(join(process.cwd(), "src/assets", path));

// Noto Sans JP Bold, subset to ASCII and the Japanese characters the
// og-image.ja.png images use. When adding Japanese text to them (the og.* and
// site.name messages in src/i18n/messages.ts), add it to
// scripts/fetch-og-font.sh and re-run the script.
const font = asset("og/NotoSansJP-Bold.ttf");
const mascot = asset("cubechan.png").then((b) => `data:image/png;base64,${b.toString("base64")}`);

/** cubechan.png is 509 × 512. */
const MASCOT_ASPECT = 509 / 512;

function Mascot({ src, height }: { src: string; height: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- rendered by ImageResponse, not the browser
  return <img src={src} alt="" width={Math.round(height * MASCOT_ASPECT)} height={height} style={{ flexShrink: 0 }} />;
}

export const SITE_HOST = new URL(SITE_URL).host;

type Parts = { Mascot: (props: { height: number }) => React.ReactNode };

/** A 1200 × 630 PNG on the site background, with `render`'s content centered. */
export async function ogImage(render: (parts: Parts) => React.ReactNode) {
  const src = await mascot;
  const parts: Parts = { Mascot: ({ height }) => <Mascot src={src} height={height} /> };
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: OG_COLORS.bg,
          color: OG_COLORS.ink,
          fontFamily: "Noto Sans JP",
        }}
      >
        {/* A stripe of the six face colors along the top. */}
        <div style={{ display: "flex", height: 16 }}>
          {FACE_COLORS.map((c) => (
            <div key={c} style={{ flex: 1, background: c }} />
          ))}
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 56,
            padding: "48px 64px 64px",
          }}
        >
          {render(parts)}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Noto Sans JP", data: await font, style: "normal", weight: 700 }],
    },
  );
}
