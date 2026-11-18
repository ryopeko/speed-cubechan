# speed-cubechan

OLL・PLL を選んで練習する個人用ツール。Next.js (App Router) + Three.js、保存は localStorage。

**サイト:** https://speed-cubechan.com/ (main に push すると GitHub Pages に公開されます)

<img src="docs/qr.svg" alt="サイトの QR コード" width="160">

```sh
npm run dev        # http://localhost:3000
npm test           # Vitest
npm run typecheck
```

- `src/lib/cube.ts` — キューブの状態(54 ステッカー)、手、記法の解釈、逆手順。描画に依存しない。
- `src/data/patterns.ts` — OLL 57・PLL 21 のアルゴリズム。
- `src/components/CubeView.tsx` — Three.js の描画(`Cube.tsx` から SSR なしで読み込む)。
- `src/app/**/og-image.png/route.tsx` — og:image(サイト共通と、パターンごと)。ビルド時に PNG を書き出す。日本語は `src/assets/og/` の Noto Sans JP(SIL OFL 1.1、`OFL.txt`)のサブセットで描くので、画像に新しい日本語の文字を足したら `scripts/fetch-og-font.sh` の文字列に加えて再実行する。
