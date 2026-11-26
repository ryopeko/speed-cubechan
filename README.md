# speed-cubechan

Speed Cube-chan(スピードキュービちゃん): OLL・PLL を選んで練習する個人用ツール。英語と日本語に対応。Next.js (App Router) + Three.js、保存は localStorage。

**サイト:** https://speed-cubechan.com/ (main に push すると GitHub Pages に公開されます)

<img src="docs/qr.svg" alt="サイトの QR コード" width="160">

```sh
npm run dev        # http://localhost:3000
npm test           # Vitest
npm run typecheck
```

- `src/lib/cube.ts` — キューブの状態(54 ステッカー)、手、記法の解釈、逆手順。描画に依存しない。
- `src/data/patterns.ts` — OLL 57・PLL 21 のアルゴリズム。
- `src/lib/scramble.ts`・`src/lib/solves.ts`・`src/components/Timer.tsx` — ソルブタイマー(`/timer`)。20 手のランダムなスクランブル、スペースキーかタッチの長押しで開始、記録(ベスト・ao5・ao12)は localStorage に保存。
- `src/components/CubeView.tsx` — Three.js の描画(`Cube.tsx` から SSR なしで読み込む)。
- `src/i18n/` — 英語・日本語の文言(`messages.ts`)と言語の切り替え。言語は `?lang=en|ja` → ヘッダーの EN / JA で選んだもの(localStorage)→ ブラウザの言語設定の順で決まり、どれもなければ英語。静的な HTML は英語で書き出し、`<head>` のインラインスクリプトが描画前に言語を決める。日本語で共有するとき(共有ボタン・QR コード)は `/ja/...` の URL を使う。`src/app/ja/` のページで、リンクのプレビューを日本語(タイトルと `og-image.ja.png`)で出し、開いた人は `?lang=ja` 付きの本来のページへ転送される。
- `src/app/**/og-image.png/route.tsx` — og:image(サイト共通と、パターンごと)。ビルド時に PNG を書き出す。英語版(`og-image.png`)と日本語版(`og-image.ja.png`、`/ja/` の共有用ページが指す)がある。日本語は `src/assets/og/` の Noto Sans JP(SIL OFL 1.1、`OFL.txt`)のサブセットで描くので、日本語版の画像に新しい日本語の文字を足したら `scripts/fetch-og-font.sh` の文字列に加えて再実行する。
