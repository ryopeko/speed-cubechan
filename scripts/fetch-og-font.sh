#!/bin/sh
# Download the font used by the og:image routes (src/app/**/og-image*.png/route.tsx):
# Noto Sans JP Bold (SIL OFL 1.1), subset by Google Fonts to the characters
# below. Re-run this after adding new Japanese text to the Japanese og:image
# (og-image.ja.png; its text is the og.* and site.name messages in src/i18n/messages.ts).
set -eu
cd "$(dirname "$0")/.."

ASCII=$(printf '%s' ' !"#$%&'"'"'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_`abcdefghijklmnopqrstuvwxyz{|}~')
JAPANESE='スピードキュービちゃん・の練習ツール'

out=src/assets/og/NotoSansJP-Bold.ttf
text=$(node -e 'process.stdout.write(encodeURIComponent(process.argv[1]))' "$ASCII$JAPANESE")
# Without a browser User-Agent, the CSS API serves TrueType, which ImageResponse can read.
url=$(curl -fsS "https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=$text" |
  sed -n 's/.*src: url(\([^)]*\)).*/\1/p')
mkdir -p "$(dirname "$out")"
curl -fsS -o "$out" "$url"
echo "wrote $out ($(wc -c <"$out" | tr -d ' ') bytes)"
