import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import cubechan from "@/assets/cubechan.png";
import DopaEffects from "@/components/DopaEffects";
import Mascot from "@/components/Mascot";
import "./globals.css";

export const metadata: Metadata = {
  title: "スピードキュービちゃん",
  description: "OLL・PLL の練習ツール",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja">
      <body className="min-h-dvh leading-relaxed">
        <header className="flex items-center border-b border-line bg-surface px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink no-underline">
            <Image src={cubechan} alt="" className="size-9" preload />
            スピードキュービちゃん
          </Link>
        </header>
        {children}
        {/* The mascot stands in front of the page (and hides ドパモード's switch). */}
        <Mascot />
        <DopaEffects />
      </body>
    </html>
  );
}
