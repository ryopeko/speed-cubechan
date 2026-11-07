"use client";

import { useMemo, useState } from "react";
import Cube from "./Cube";
import Tabs from "./Tabs";
import { applyMoves, formatMove, invertMoves, parseAlg, SOLVED } from "@/lib/cube";
import type { Pattern } from "@/data/patterns";

type Mode = "alg" | "setup";

/**
 * Shows one case in 3D with its algorithm and setup.
 * "alg" starts from the case and solves it; "setup" starts solved and builds the case.
 */
export default function CasePlayer({
  pattern,
  showAnswer = true,
}: {
  pattern: Pattern;
  showAnswer?: boolean;
}) {
  const { algMoves, setupMoves, caseState } = useMemo(() => {
    const algMoves = parseAlg(pattern.alg);
    const setupMoves = invertMoves(algMoves);
    return { algMoves, setupMoves, caseState: applyMoves(SOLVED, setupMoves) };
  }, [pattern.alg]);

  const [mode, setMode] = useState<Mode>("alg");
  const [position, setPosition] = useState(0);

  const start = mode === "alg" ? caseState : SOLVED;
  const moves = mode === "alg" ? algMoves : setupMoves;
  const done = position >= moves.length;

  return (
    <div className="flex flex-col gap-3">
      <Cube start={start} moves={moves} position={showAnswer ? position : 0} />

      {showAnswer && (
        <>
          <Tabs
            options={[
              ["alg", "(a) アルゴリズム"],
              ["setup", "(b) セットアップ"],
            ]}
            value={mode}
            onChange={(m) => {
              setMode(m);
              setPosition(0);
            }}
          />

          <p className="text-muted">
            {mode === "alg"
              ? "この形から、アルゴリズムで揃えます。"
              : "揃った状態から、セットアップでこの形を作ります。"}
          </p>

          <ol className="flex flex-wrap gap-1.5" aria-label="手順">
            {moves.map((m, i) => (
              <li
                key={i}
                className={`min-w-[2.4em] rounded-md border bg-surface px-2 py-0.5 text-center font-mono ${
                  i < position
                    ? "border-line opacity-40"
                    : i === position
                      ? "border-accent font-bold ring-1 ring-accent"
                      : "border-line"
                }`}
              >
                {formatMove(m)}
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => setPosition(0)} disabled={position === 0}>
              ⏮ 最初に戻す
            </button>
            <button
              className="btn"
              onClick={() => setPosition((p) => Math.max(0, p - 1))}
              disabled={position === 0}
            >
              ◀ 1 手戻す
            </button>
            <button
              className="btn-primary"
              onClick={() => setPosition((p) => Math.min(moves.length, p + 1))}
              disabled={done}
            >
              1 手進める ▶
            </button>
          </div>
          <p className="text-muted">
            {position} / {moves.length} 手
            {done && (mode === "alg" ? " ・ 揃いました" : " ・ 形ができました")}
          </p>

          <dl className="rounded-xl border border-line bg-surface p-3">
            <dt className="text-sm text-muted">アルゴリズム</dt>
            <dd className="mb-2 font-mono wrap-anywhere">{pattern.alg}</dd>
            <dt className="text-sm text-muted">セットアップ</dt>
            <dd className="font-mono wrap-anywhere">{setupMoves.map(formatMove).join(" ")}</dd>
          </dl>
        </>
      )}
    </div>
  );
}
