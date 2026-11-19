import JaSharePage from "@/components/JaSharePage";
import { findPattern, PATTERNS } from "@/data/patterns";
import { translate } from "@/i18n/messages";
import { ogMetadata } from "@/lib/og";

/** The Japanese share page for a pattern page (see JaSharePage). */

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/ja/patterns/[id]">) {
  const { id } = await props.params;
  const name = findPattern(id)?.name ?? "?";
  return {
    title: translate("ja", "pattern.title", { name }),
    description: translate("ja", "site.description"),
    alternates: { canonical: `/patterns/${id}/` },
    ...ogMetadata(`/patterns/${id}/og-image.ja.png`, translate("ja", "pattern.ogAlt", { name }), "ja"),
  };
}

export default async function JaPattern(props: PageProps<"/ja/patterns/[id]">) {
  const { id } = await props.params;
  return <JaSharePage path={`/patterns/${id}/`} />;
}
