import { notFound } from "next/navigation";
import { Suspense } from "react";
import CasePlayer from "@/components/CasePlayer";
import { CUBE_BOX } from "@/components/cubeBox";
import Main, { Title } from "@/components/Main";
import MarkButton from "@/components/MarkButton";
import QrCode from "@/components/QrCode";
import { findPattern, PATTERNS } from "@/data/patterns";
import { LANGS, translate } from "@/i18n/messages";
import T, { DocTitle } from "@/i18n/T";
import { ogMetadata } from "@/lib/og";
import { sharePath, siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/patterns/[id]">) {
  const { id } = await props.params;
  const name = findPattern(id)?.name ?? "?";
  return {
    title: translate("en", "pattern.title", { name }),
    ...ogMetadata(`/patterns/${id}/og-image.png`, translate("en", "pattern.ogAlt", { name })),
  };
}

export default function PatternPage(props: PageProps<"/patterns/[id]">) {
  return (
    <Main>
      <Suspense fallback={<div className={CUBE_BOX} />}>
        <PatternDetail params={props.params} />
      </Suspense>
    </Main>
  );
}

async function PatternDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pattern = findPattern(id);
  if (!pattern) notFound();

  return (
    <>
      <DocTitle k="pattern.title" vars={{ name: pattern.name }} />
      <div className="mb-2 flex items-center justify-between gap-3">
        <Title>{pattern.name}</Title>
        <MarkButton id={pattern.id} />
      </div>
      <CasePlayer
        key={pattern.id}
        pattern={pattern}
        sharePagePath={`/patterns/${pattern.id}/`}
      />
      <section className="mt-8 flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        {/* One code per language (the Japanese one opens the /ja/ share page); CSS shows the current one. */}
        {LANGS.map((lang) => (
          <QrCode
            key={lang}
            value={siteUrl(sharePath(`/patterns/${pattern.id}/`, lang))}
            labelledBy="qr-label"
            className={`size-28 shrink-0 rounded-md lang-only-${lang}`}
          />
        ))}
        <span id="qr-label" hidden>
          <T k="pattern.qrLabel" vars={{ name: pattern.name }} />
        </span>
        <p className="text-sm text-muted">
          <T k="pattern.qrNote" vars={{ name: pattern.name }} />
        </p>
      </section>
    </>
  );
}
