import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import cubechan from "@/assets/cubechan.png";
import DopaEffects from "@/components/DopaEffects";
import LangSwitch from "@/components/LangSwitch";
import Mascot from "@/components/Mascot";
import { LANG_INIT_SCRIPT } from "@/i18n/lang";
import { translate } from "@/i18n/messages";
import T from "@/i18n/T";
import { ogMetadata } from "@/lib/og";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  // Makes the og:image URLs absolute.
  metadataBase: new URL(SITE_URL),
  title: translate("en", "site.name"),
  description: translate("en", "site.description"),
  ...ogMetadata("/og-image.png", `${translate("en", "site.name")} — ${translate("en", "site.description")}`),
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // The init script may change lang before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: LANG_INIT_SCRIPT }} />
      </head>
      <body className="min-h-dvh leading-relaxed">
        <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2">
          <Link href="/" className="flex items-center gap-2 font-bold text-ink no-underline">
            <Image src={cubechan} alt="" className="size-9" preload />
            <T k="site.name" />
          </Link>
          <LangSwitch />
        </header>
        {children}
        <footer className="mx-auto max-w-3xl px-4 pb-6 text-sm">
          <Link href="/terms/" className="text-muted hover:text-ink">
            <T k="terms.title" />
          </Link>
        </footer>
        {/* The mascot stands in front of the page (and hides Dopa Mode's switch). */}
        <Mascot />
        <DopaEffects />
      </body>
    </html>
  );
}
