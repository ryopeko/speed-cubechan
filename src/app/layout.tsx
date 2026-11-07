import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "speed-cubechan",
  description: "OLL・PLL の練習ツール",
};

const LOGO_COLORS = [
  "bg-cube-orange",
  "bg-cube-red",
  "bg-cube-yellow",
  "bg-cube-blue",
  "bg-cube-white",
  "bg-cube-green",
];

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="min-h-dvh leading-relaxed">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink no-underline">
            <span className="grid grid-cols-3 gap-px rounded-sm bg-line p-px" aria-hidden>
              {LOGO_COLORS.map((c, i) => (
                <span key={i} className={`size-2 rounded-[2px] ${c}`} />
              ))}
            </span>
            speed-cubechan
          </Link>
          <nav className="flex gap-4">
            <Link href="/">一覧</Link>
            <Link href="/practice">練習</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
