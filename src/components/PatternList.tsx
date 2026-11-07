"use client";

import Link from "next/link";
import { useState } from "react";
import MarkButton from "./MarkButton";
import { useMarks } from "@/lib/marks";
import { OLL_PATTERNS, PLL_PATTERNS, type Pattern } from "@/data/patterns";

type Filter = "all" | "marked" | "unmarked";

export default function PatternList() {
  const { isMarked } = useMarks();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = (list: readonly Pattern[]) =>
    list.filter((p) => filter === "all" || (filter === "marked") === isMarked(p.id));

  return (
    <>
      <div className="tabs" role="tablist">
        {(
          [
            ["all", "すべて"],
            ["marked", "覚えた"],
            ["unmarked", "未"],
          ] as const
        ).map(([f, label]) => (
          <button key={f} role="tab" aria-selected={filter === f} onClick={() => setFilter(f)}>
            {label}
          </button>
        ))}
      </div>

      {[
        ["OLL", OLL_PATTERNS],
        ["PLL", PLL_PATTERNS],
      ].map(([title, list]) => {
        const all = list as readonly Pattern[];
        const shown = visible(all);
        return (
          <section key={title as string}>
            <h2>
              {title as string}
              <span className="count">
                {all.filter((p) => isMarked(p.id)).length} / {all.length} 覚えた
              </span>
            </h2>
            {shown.length === 0 ? (
              <p className="empty">該当なし</p>
            ) : (
              <ul className="pattern-list">
                {shown.map((p) => (
                  <li key={p.id}>
                    <Link href={`/patterns/${p.id}`}>
                      <span className="name">{p.name}</span>
                      <code>{p.alg}</code>
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
