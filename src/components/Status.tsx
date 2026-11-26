"use client";

import Link from "next/link";
import { OLL_PATTERNS, PATTERNS, PLL_PATTERNS } from "@/data/patterns";
import { useLang, useT } from "@/i18n/useLang";
import { useMarks } from "@/lib/marks";
import { formatTime, useSolves } from "@/lib/solves";
import { progressOf, solveSummary, type Progress } from "@/lib/status";

/** The learning progress and solve records, from this browser's storage. */
export default function Status() {
  const t = useT();
  const lang = useLang();
  const { marks } = useMarks();
  const { solves } = useSolves();

  const rows: [string, Progress][] = [
    ["OLL", progressOf(OLL_PATTERNS, marks)],
    ["PLL", progressOf(PLL_PATTERNS, marks)],
    [t("me.allPatterns"), progressOf(PATTERNS, marks)],
  ];
  const summary = solveSummary(solves);
  const stats: [string, number | undefined][] = [
    [t("timer.best"), summary.best],
    ["ao5", summary.ao5],
    ["ao12", summary.ao12],
  ];

  return (
    <>
      <p className="text-muted">{t("me.note")}</p>

      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">{t("me.patterns")}</h2>
          <Link href="/" className="text-sm">
            {t("me.toList")}
          </Link>
        </div>
        <ul className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface">
          {rows.map(([label, p]) => (
            <li key={label} className="px-3 py-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <span className="font-bold">{label}</span>
                <span className="text-sm tabular-nums">
                  <span className="font-semibold text-mark">{t("me.learnedOf", { learned: p.learned, total: p.total })}</span>
                  <span className="text-muted">
                    {" · "}
                    {t("status.practicing")} {p.practicing}
                  </span>
                </span>
              </div>
              <ProgressBar progress={p} />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">{t("me.solves")}</h2>
          <Link href="/timer" className="text-sm">
            {t("me.toTimer")}
          </Link>
        </div>
        <dl className="mt-2 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-surface p-2">
            <dt className="text-xs text-muted">{t("me.count")}</dt>
            <dd className="font-mono text-xl font-bold tabular-nums">{summary.count}</dd>
          </div>
          {stats.map(([label, ms]) => (
            <div key={label} className="rounded-xl border border-line bg-surface p-2">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-mono text-xl font-bold tabular-nums">{ms === undefined ? "–" : formatTime(ms)}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-sm text-muted">
          {summary.lastAt === undefined
            ? t("timer.empty")
            : t("me.lastSolve", {
                date: new Intl.DateTimeFormat(lang, { dateStyle: "medium", timeStyle: "short" }).format(summary.lastAt),
              })}
        </p>
      </section>
    </>
  );
}

/** Learned and practicing as shares of a bar; the numbers beside it say the same. */
function ProgressBar({ progress: p }: { progress: Progress }) {
  const pct = (n: number) => `${(n / p.total) * 100}%`;
  return (
    <div aria-hidden className="mt-1.5 flex h-2.5 overflow-hidden rounded-full bg-line">
      <div className="bg-mark" style={{ width: pct(p.learned) }} />
      <div className="bg-practice" style={{ width: pct(p.practicing) }} />
    </div>
  );
}
