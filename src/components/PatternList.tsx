"use client";

import Link from "next/link";
import { useState } from "react";
import MarkButton from "./MarkButton";
import Segmented from "./Segmented";
import { useMarks } from "@/lib/marks";
import { OLL_PATTERNS, PATTERNS, PLL_PATTERNS, type Pattern } from "@/data/patterns";

type Filter = "all" | "marked" | "unmarked";

const SECTIONS = [
  ["OLL", OLL_PATTERNS],
  ["PLL", PLL_PATTERNS],
] as const;

export default function PatternList() {
  const { isMarked } = useMarks();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = (list: readonly Pattern[]) =>
    list.filter((p) => filter === "all" || (filter === "marked") === isMarked(p.id));
  const markedCount = PATTERNS.filter((p) => isMarked(p.id)).length;

  return (
    <>
      <Segmented
        label="表示するパターン"
        options={[
          { value: "all", label: "すべて", count: PATTERNS.length },
          { value: "marked", label: "覚えた", count: markedCount },
          { value: "unmarked", label: "まだ", count: PATTERNS.length - markedCount },
        ]}
        value={filter}
        onChange={setFilter}
      />

      {SECTIONS.map(([title, all]) => {
        const shown = visible(all);
        return (
          <section key={title}>
            <h2 className="mt-6 mb-2 flex items-baseline gap-3 text-xl font-bold">
              {title}
              <span className="text-sm font-normal text-muted">
                {all.filter((p) => isMarked(p.id)).length} / {all.length} 覚えた
              </span>
            </h2>
            {shown.length === 0 ? (
              <p className="text-muted">該当なし</p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {shown.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 px-3 py-2">
                    <Link
                      href={`/patterns/${p.id}`}
                      className="flex min-w-0 flex-1 flex-wrap gap-x-3 text-ink no-underline hover:text-accent"
                    >
                      <span className="min-w-[6.5em] font-semibold">{p.name}</span>
                      <code className="font-mono text-sm wrap-anywhere text-muted">{p.alg}</code>
                    </Link>
                    <MarkButton id={p.id} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </>
  );
}
