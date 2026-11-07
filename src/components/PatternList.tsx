"use client";

import Link from "next/link";
import { useState } from "react";
import CaseThumb from "./CaseThumb";
import Segmented from "./Segmented";
import { useMarks } from "@/lib/marks";
import { PATTERNS, type Pattern, type PatternKind } from "@/data/patterns";

type KindFilter = "all" | PatternKind;
/** Which rows to show: learned ones, not-yet ones, or both. */
type MarkShow = { marked: boolean; unmarked: boolean };

const KINDS: readonly PatternKind[] = ["OLL", "PLL"];

export default function PatternList() {
  const { isMarked } = useMarks();
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [markShow, setMarkShow] = useState<MarkShow>({ marked: true, unmarked: true });

  const matchesMark = (p: Pattern) => (isMarked(p.id) ? markShow.marked : markShow.unmarked);
  const matchesKind = (p: Pattern, f: KindFilter) => f === "all" || p.kind === f;
  // Each count is what that option would show, given the other filter.
  const countKind = (f: KindFilter) => PATTERNS.filter((p) => matchesMark(p) && matchesKind(p, f)).length;
  const inKind = PATTERNS.filter((p) => matchesKind(p, kindFilter));
  const markedCount = inKind.filter((p) => isMarked(p.id)).length;

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Segmented
          label="種類"
          options={[
            { value: "all", label: "すべて", count: countKind("all") },
            { value: "OLL", label: "OLL", count: countKind("OLL") },
            { value: "PLL", label: "PLL", count: countKind("PLL") },
          ]}
          value={kindFilter}
          onChange={setKindFilter}
        />
        <div
          role="group"
          aria-label="表示する状態"
          className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-line bg-surface p-1 sm:inline-grid"
        >
          <ShowToggle
            label="覚えた"
            emoji="✅"
            count={markedCount}
            checked={markShow.marked}
            onChange={(v) => setMarkShow((s) => ({ ...s, marked: v }))}
          />
          <ShowToggle
            label="まだ"
            emoji="☑️"
            count={inKind.length - markedCount}
            checked={markShow.unmarked}
            onChange={(v) => setMarkShow((s) => ({ ...s, unmarked: v }))}
          />
        </div>
      </div>

      {KINDS.filter((k) => kindFilter === "all" || k === kindFilter).map((kind) => {
        const all = PATTERNS.filter((p) => p.kind === kind);
        const shown = all.filter(matchesMark);
        return (
          <details key={kind} open className="group mt-6">
            <summary className="mb-2 flex cursor-pointer list-none items-baseline gap-3 select-none [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden
                className="inline-block w-4 self-center text-sm text-muted transition-transform group-open:rotate-90"
              >
                ▶
              </span>
              <h2 className="text-xl font-bold">{kind}</h2>
              <span className="text-sm text-muted">
                {all.filter((p) => isMarked(p.id)).length} / {all.length} 覚えた
              </span>
            </summary>
            {shown.length === 0 ? (
              <p className="text-muted">該当なし</p>
            ) : (
              <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
                {shown.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/patterns/${p.id}`}
                      className="flex items-center gap-3 px-3 py-2 text-ink no-underline hover:bg-bg"
                    >
                      <CaseThumb pattern={p} className="h-16 w-20 shrink-0" />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-semibold">{p.name}</span>
                        <code className="font-mono text-sm wrap-anywhere text-muted">{p.alg}</code>
                      </span>
                      {isMarked(p.id) && <LearnedCheck />}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </details>
        );
      })}
    </>
  );
}

/** An emoji chip that shows or hides one group of rows; faded when off. */
function ShowToggle({
  label,
  emoji,
  count,
  checked,
  onChange,
}: {
  label: string;
  emoji: string;
  count: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      aria-label={`${label} (${count})`}
      title={label}
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-1.5 whitespace-nowrap transition aria-checked:bg-accent/15 not-aria-checked:opacity-40 not-aria-checked:grayscale hover:not-aria-checked:opacity-70"
    >
      <span aria-hidden className="text-lg leading-none">
        {emoji}
      </span>
      <span aria-hidden className="min-w-[1.75em] rounded-full bg-line/70 px-1.5 text-center text-xs leading-5 tabular-nums">
        {count}
      </span>
    </button>
  );
}

/** The same green check as the "覚えた" checkbox, shown on learned rows. */
function LearnedCheck() {
  return (
    <span
      role="img"
      aria-label="覚えた"
      className="grid size-6 shrink-0 place-items-center rounded-md bg-mark text-sm leading-none font-bold text-white"
    >
      ✓
    </span>
  );
}
