import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CasePlayer from "@/components/CasePlayer";
import MarkButton from "@/components/MarkButton";
import { findPattern, PATTERNS } from "@/data/patterns";

export function generateStaticParams() {
  return PATTERNS.map((p) => ({ id: p.id }));
}

export async function generateMetadata(props: PageProps<"/patterns/[id]">) {
  const { id } = await props.params;
  return { title: `${findPattern(id)?.name ?? "?"} | speed-cubechan` };
}

export default function PatternPage(props: PageProps<"/patterns/[id]">) {
  return (
    <main>
      <Suspense fallback={<div className="cube-view cube-loading" />}>
        <PatternDetail params={props.params} />
      </Suspense>
    </main>
  );
}

async function PatternDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pattern = findPattern(id);
  if (!pattern) notFound();

  const index = PATTERNS.indexOf(pattern);
  const prev = PATTERNS[index - 1];
  const next = PATTERNS[index + 1];

  return (
    <>
      <div className="title-row">
        <h1>{pattern.name}</h1>
        <MarkButton id={pattern.id} />
      </div>
      <CasePlayer key={pattern.id} pattern={pattern} />
      <nav className="pager">
        {prev ? <Link href={`/patterns/${prev.id}`}>← {prev.name}</Link> : <span />}
        {next ? <Link href={`/patterns/${next.id}`}>{next.name} →</Link> : <span />}
      </nav>
    </>
  );
}
