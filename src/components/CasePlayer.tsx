"use client";

import { useEffect, useMemo, useState } from "react";
import Cube from "./Cube";
import Tabs from "./Tabs";
import { applyMoves, formatMove, invertMoves, parseAlg, SOLVED, type Move } from "@/lib/cube";
import type { Pattern } from "@/data/patterns";

type Mode = "alg" | "setup";
type Speed = "slow" | "normal" | "fast";

/** Quarter-turn time and the pause after each move, in ms. */
const SPEEDS: Record<Speed, { label: string; turn: number; pause: number }> = {
  slow: { label: "ゆっくり", turn: 700, pause: 900 },
  normal: { label: "ふつう", turn: 300, pause: 500 },
  fast: { label: "はやい", turn: 180, pause: 150 },
};

const turnTime = (move: Move, turn: number) => turn * (move.amount === 2 ? 2 : 1);

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
  const [speed, setSpeed] = useState<Speed>("slow");
  const [playing, setPlaying] = useState(false);
  /** Where playback started; the first move there plays without waiting. */
  const [playFrom, setPlayFrom] = useState(0);

  const start = mode === "alg" ? caseState : SOLVED;
  const moves = mode === "alg" ? algMoves : setupMoves;
  const done = position >= moves.length;
  const isPlaying = playing && !done;

  // Auto play: after each move finishes turning, pause, then make the next one.
  useEffect(() => {
    if (!isPlaying) return;
    const { turn, pause } = SPEEDS[speed];
    const delay = position === playFrom ? 200 : turnTime(moves[position - 1], turn) + pause;
    const timer = setTimeout(() => setPosition((p) => p + 1), delay);
    return () => clearTimeout(timer);
  }, [isPlaying, position, playFrom, moves, speed]);

  /** Any manual control stops playback first. */
  const go = (to: number) => {
    setPlaying(false);
    setPosition(Math.max(0, Math.min(moves.length, to)));
  };

  const togglePlay = () => {
    if (isPlaying) return setPlaying(false);
    const from = done ? 0 : position;
    setPosition(from);
    setPlayFrom(from);
    setPlaying(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <Cube
        start={start}
        moves={moves}
        position={showAnswer ? position : 0}
        quarterTurnMs={SPEEDS[speed].turn}
      />

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
              go(0);
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
                aria-current={i === position - 1 ? "step" : undefined}
                className={`min-w-[2.4em] rounded-md border px-2 py-0.5 text-center font-mono ${
                  i === position - 1
                    ? "border-accent bg-accent font-bold text-white"
                    : i < position
                      ? "border-line bg-surface opacity-40"
                      : i === position
                        ? "border-dashed border-accent bg-surface text-accent"
                        : "border-line bg-surface"
                }`}
              >
                {formatMove(m)}
              </li>
            ))}
          </ol>

          <div className="flex flex-wrap gap-2">
            <button className="btn" onClick={() => go(0)} disabled={position === 0}>
              ⏮ 最初に戻す
            </button>
            <button
              className="btn"
              onClick={() => go(position - 1)}
              disabled={position === 0}
            >
              ◀ 1 手戻す
            </button>
            <button
              className="btn-primary"
              onClick={() => go(position + 1)}
              disabled={done}
            >
              {done ? "おわり" : `${formatMove(moves[position])} を回す ▶`}
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="btn min-w-[9em]" onClick={togglePlay}>
              {isPlaying ? "⏸ 止める" : done ? "↺ もう一度再生" : "▶ 自動で再生"}
            </button>
            <span className="ml-2 text-sm text-muted">速さ</span>
            <Tabs
              options={(Object.keys(SPEEDS) as Speed[]).map((k) => [k, SPEEDS[k].label] as const)}
              value={speed}
              onChange={setSpeed}
            />
          </div>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted">
            <span>
              {position} / {moves.length} 手
              {done && (mode === "alg" ? " ・ 揃いました" : " ・ 形ができました")}
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="inline-block size-3 rounded-sm bg-accent" /> いま回した手
            </span>
            <span className="flex items-center gap-1.5 text-sm">
              <span className="inline-block size-3 rounded-sm border border-dashed border-accent" /> 次の手
            </span>
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
