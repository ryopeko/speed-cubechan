import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "speed-cubechan",
  description: "OLL・PLL の練習ツール",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <Link href="/" className="logo">
            speed-cubechan
          </Link>
          <nav>
            <Link href="/">一覧</Link>
            <Link href="/practice">練習</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
