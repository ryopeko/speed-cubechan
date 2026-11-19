import type { Metadata } from "next";
import JaSharePage from "@/components/JaSharePage";
import { translate } from "@/i18n/messages";
import { ogMetadata } from "@/lib/og";

/** The Japanese share page for the top page (see JaSharePage). */

export const metadata: Metadata = {
  title: translate("ja", "site.name"),
  description: translate("ja", "site.description"),
  alternates: { canonical: "/" },
  ...ogMetadata("/og-image.ja.png", `${translate("ja", "site.name")} — ${translate("ja", "site.description")}`, "ja"),
};

export default function JaHome() {
  return <JaSharePage path="/" />;
}
