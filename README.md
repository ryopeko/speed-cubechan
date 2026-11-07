# speed-cubechan

OLL・PLL を選んで練習する個人用ツール。Next.js (App Router) + Three.js、保存は localStorage。

**サイト:** https://ryopeko.github.io/speed-cubechan/ (main に push すると GitHub Pages に公開されます)

<img src="docs/qr.svg" alt="サイトの QR コード" width="160">

```sh
npm run dev        # http://localhost:3000
npm test           # Vitest
npm run typecheck
```

- `src/lib/cube.ts` — キューブの状態(54 ステッカー)、手、記法の解釈、逆手順。描画に依存しない。
- `src/data/patterns.ts` — OLL 57・PLL 21 のアルゴリズム。
- `src/components/CubeView.tsx` — Three.js の描画(`Cube.tsx` から SSR なしで読み込む)。
