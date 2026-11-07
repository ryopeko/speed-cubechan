"use client";

import Link from "next/link";
import { useState } from "react";
import CasePlayer from "./CasePlayer";
import MarkButton from "./MarkButton";
import Tabs from "./Tabs";
import { useMarks } from "@/lib/marks";
import { findPattern, type Pattern, type PatternKind } from "@/data/patterns";

type KindFilter = "all" | PatternKind;

/** Pick a random pattern, avoiding the current one when there is a choice. */
function pick(pool: readonly Pattern[], current?: Pattern): Pattern | undefined {
  const choices = pool.length > 1 ? pool.filter((p) => p.id !== current?.id) : pool;
  return choices[Math.floor(Math.random() * choices.length)];
}

export default function Practice() {
  const { marked } = useMarks();
  const [kind, setKind] = useState<KindFilter>("all");
  const [current, setCurrent] = useState<Pattern>();
  const [revealed, setRevealed] = useState(false);
  // Bumped on every draw so the player resets even if the same case comes up again.
  const [round, setRound] = useState(0);

  const pool = marked
    .map(findPattern)
    .filter((p): p is Pattern => !!p && (kind === "all" || p.kind === kind));

  const next = () => {
    setCurrent(pick(pool, current));
    setRevealed(false);
    setRound((r) => r + 1);
  };

  return (
    <>
      <Tabs
        options={[
          ["all", "すべて"],
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
          覚えたパターンがありません。<Link href="/">一覧</Link>で「覚えた」を付けてください。
        </p>
      ) : !current ? (
        <div className="mt-4 flex flex-col items-start gap-2">
          <p>覚えた {pool.length} 個の中から、ランダムに 1 つ出します。</p>
          <button className="btn-primary" onClick={next}>
            はじめる
          </button>
        </div>
      ) : (
        <>
          <p className="my-3 text-muted">
            {revealed ? (
              <>
                <strong className="text-ink">{current.name}</strong>{" "}
                <Link href={`/patterns/${current.id}`}>詳細</Link>
              </>
            ) : (
              "この形の手順を思い出してから、答えを見てください。"
            )}
          </p>
          <CasePlayer key={`${current.id}-${round}`} pattern={current} showAnswer={revealed} />
          <div className="mt-3 flex flex-wrap gap-2">
            {revealed ? (
              <>
                <MarkButton id={current.id} />
                <button className="btn-primary" onClick={next}>
                  次へ ▶
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => setRevealed(true)}>
                答えを見る
              </button>
            )}
          </div>
        </>
      )}
    </>
  );
}
