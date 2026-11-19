"use client";

import Link from "next/link";
import { useState } from "react";
import CasePlayer from "./CasePlayer";
import MarkButton from "./MarkButton";
import Tabs from "./Tabs";
import { useMarks } from "@/lib/marks";
import { PATTERNS, type Pattern, type PatternKind } from "@/data/patterns";
import { useT } from "@/i18n/useLang";

type KindFilter = "all" | PatternKind;

/** Pick a random pattern, avoiding the current one when there is a choice. */
function pick(pool: readonly Pattern[], current?: Pattern): Pattern | undefined {
  const choices = pool.length > 1 ? pool.filter((p) => p.id !== current?.id) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function Practice() {
  const { marks } = useMarks();
  const t = useT();
  const [kind, setKind] = useState<KindFilter>("all");
  const [current, setCurrent] = useState<Pattern>();
  const [revealed, setRevealed] = useState(false);
  // Bumped on every draw so the player resets even if the same case comes up again.
  const [round, setRound] = useState(0);

  const pool = PATTERNS.filter((p) => marks[p.id] === "learned" && (kind === "all" || p.kind === kind));

  const next = () => {
    setCurrent(pick(pool, current));
    setRevealed(false);
    setRound((r) => r + 1);
  };

  return (
    <>
      <Tabs
        options={[
          ["all", t("list.all")],
          ["OLL", "OLL"],
          ["PLL", "PLL"],
        ]}
        value={kind}
        onChange={(k) => {
          setKind(k);
          setCurrent(undefined);
        }}
      />

      {pool.length === 0 ? (
        <p className="mt-4 text-muted">
          {t("practice.emptyBefore")}
          <Link href="/">{t("practice.emptyLink")}</Link>
          {t("practice.emptyAfter")}
        </p>
      ) : !current ? (
        <div className="mt-4 flex flex-col items-start gap-2">
          <p>{t("practice.intro", { count: pool.length })}</p>
          <button className="btn-primary" onClick={next}>
            {t("practice.start")}
          </button>
        </div>
      ) : (
        <>
          <p className="my-3 text-muted">
            {revealed ? (
              <>
                <strong className="text-ink">{current.name}</strong>{" "}
                <Link href={`/patterns/${current.id}`}>{t("practice.details")}</Link>
              </>
            ) : (
              t("practice.prompt")
            )}
          </p>
          <CasePlayer key={`${current.id}-${round}`} pattern={current} showAnswer={revealed} />
          <div className="mt-3 flex flex-wrap gap-2">
            {revealed ? (
              <>
                <MarkButton id={current.id} />
                <button className="btn-primary" onClick={next}>
                  {t("practice.next")}
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setRevealed(true)}>
                {t("practice.reveal")}
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
