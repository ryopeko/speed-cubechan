import { notFound } from "next/navigation";
import { Suspense } from "react";
import CasePlayer from "@/components/CasePlayer";
import { CUBE_BOX } from "@/components/cubeBox";
import Main, { Title } from "@/components/Main";
import MarkButton from "@/components/MarkButton";
import QrCode from "@/components/QrCode";
import { findPattern, PATTERNS } from "@/data/patterns";
import { siteUrl } from "@/lib/site";

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/patterns/[id]">) {
  const { id } = await props.params;
  return { title: `${findPattern(id)?.name ?? "?"} | スピードキュービちゃん` };
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <Title>{pattern.name}</Title>
        <MarkButton id={pattern.id} />
      </div>
      <CasePlayer
        key={pattern.id}
        pattern={pattern}
        share={{ url: siteUrl(`/patterns/${pattern.id}/`), title: `${pattern.name} | スピードキュービちゃん` }}
      />
      <section className="mt-8 flex items-center gap-4 rounded-xl border border-line bg-surface p-4">
        <QrCode
          value={siteUrl(`/patterns/${pattern.id}/`)}
          label={`${pattern.name} のページの QR コード`}
          className="size-28 shrink-0 rounded-md"
        />
        <p className="text-sm text-muted">
          スマホのカメラで読み取ると、この {pattern.name} のページが開きます。
        </p>
      </section>
    </>
  );
}
