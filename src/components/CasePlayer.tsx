"use client";

import { useMemo, useState } from "react";
import Cube from "./Cube";
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

  const switchMode = (m: Mode) => {
    setMode(m);
    setPosition(0);
  };

  return (
    <div className="player">
      <Cube start={start} moves={moves} position={showAnswer ? position : 0} />

      {showAnswer && (
        <>
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={mode === "alg"} onClick={() => switchMode("alg")}>
              (a) アルゴリズム
            </button>
            <button role="tab" aria-selected={mode === "setup"} onClick={() => switchMode("setup")}>
              (b) セットアップ
            </button>
          </div>

          <p className="hint">
            {mode === "alg"
              ? "この形から、アルゴリズムで揃えます。"
              : "揃った状態から、セットアップでこの形を作ります。"}
          </p>

          <ol className="moves" aria-label="手順">
            {moves.map((m, i) => (
              <li
                key={i}
                className={i < position ? "done" : i === position ? "next" : undefined}
              >
                {formatMove(m)}
              </li>
            ))}
          </ol>

          <div className="controls">
            <button onClick={() => setPosition(0)} disabled={position === 0}>
              ⏮ 最初に戻す
            </button>
            <button onClick={() => setPosition((p) => Math.max(0, p - 1))} disabled={position === 0}>
              ◀ 1 手戻す
            </button>
            <button
              className="primary"
              onClick={() => setPosition((p) => Math.min(moves.length, p + 1))}
              disabled={done}
            >
              1 手進める ▶
            </button>
          </div>
          <p className="progress">
            {position} / {moves.length} 手{done && (mode === "alg" ? " ・ 揃いました" : " ・ 形ができました")}
          </p>

          <dl className="algs">
            <dt>アルゴリズム</dt>
            <dd>
              <code>{pattern.alg}</code>
            </dd>
            <dt>セットアップ</dt>
            <dd>
              <code>{setupMoves.map(formatMove).join(" ")}</code>
            </dd>
          </dl>
        </>
      )}
    </div>
  );
}
