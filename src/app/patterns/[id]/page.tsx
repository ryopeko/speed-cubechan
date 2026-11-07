import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import CasePlayer from "@/components/CasePlayer";
import { CUBE_BOX } from "@/components/cubeBox";
import Main, { Title } from "@/components/Main";
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

  const index = PATTERNS.indexOf(pattern);
  const prev = PATTERNS[index - 1];
  const next = PATTERNS[index + 1];

  return (
    <>
      <div className="mb-2 flex items-center justify-between gap-3">
        <Title>{pattern.name}</Title>
        <MarkButton id={pattern.id} />
      </div>
      <CasePlayer key={pattern.id} pattern={pattern} />
      <nav className="mt-6 flex justify-between">
        {prev ? <Link href={`/patterns/${prev.id}`}>← {prev.name}</Link> : <span />}
        {next ? <Link href={`/patterns/${next.id}`}>{next.name} →</Link> : <span />}
      </nav>
    </>
  );
}
