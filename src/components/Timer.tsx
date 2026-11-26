"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cube from "./Cube";
import { CUBE_BOX } from "./cubeBox";
import { useT } from "@/i18n/useLang";
import type { Move } from "@/lib/cube";
import { newScramble, scrambledState } from "@/lib/scramble";
import { averageOf, best, formatTime, useSolves } from "@/lib/solves";

/**
 * idle: waiting. holding: pressed, not long enough yet. ready: let go to start.
 * running: timing; any key or tap stops it.
 */
type Phase = "idle" | "holding" | "ready" | "running";

/** How long to hold before letting go starts the timer. */
const HOLD_MS = 300;

const PHASE_COLOR: Record<Phase, string> = {
  idle: "text-ink",
  holding: "text-practice",
  ready: "text-mark",
  running: "text-ink",
};

/** The 3D view shows a still state, so it gets no moves to play. */
const NO_MOVES: readonly Move[] = [];

const MODIFIER_KEYS = new Set(["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"]);

export default function Timer() {
  const t = useT();
  const { solves, add, remove, clear } = useSolves();
  const [phase, setPhaseState] = useState<Phase>("idle");
  const [shown, setShown] = useState(0);
  // Made in the browser only, so the static HTML does not fix one scramble for everyone.
  const [scramble, setScramble] = useState<string>();
  const scrambled = useMemo(() => (scramble === undefined ? undefined : scrambledState(scramble)), [scramble]);
  // After a tap stops the timer, the overlay stays until that tap's click, so it lands nowhere else.
  const [overlayHeld, setOverlayHeld] = useState(false);

  // Event handlers read these, so they stay in sync without re-subscribing.
  const phaseRef = useRef<Phase>("idle");
  const startRef = useRef(0);
  const holdTimer = useRef<number>(undefined);
  const scrambleRef = useRef<string>(undefined);

  const setPhase = useCallback((p: Phase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  const shuffle = useCallback(() => {
    const s = newScramble();
    scrambleRef.current = s;
    setScramble(s);
  }, []);

  useEffect(shuffle, [shuffle]);

  /** Pressed (Space or a touch on the timer). */
  const press = useCallback(() => {
    if (phaseRef.current !== "idle") return;
    setOverlayHeld(false);
    setPhase("holding");
    holdTimer.current = window.setTimeout(() => setPhase("ready"), HOLD_MS);
  }, [setPhase]);

  /** Let go: starts the timer if it was held long enough. */
  const release = useCallback(() => {
    const p = phaseRef.current;
    if (p !== "holding" && p !== "ready") return;
    window.clearTimeout(holdTimer.current);
    if (p === "ready") {
      startRef.current = performance.now();
      setShown(0);
      setPhase("running");
    } else {
      setPhase("idle");
    }
  }, [setPhase]);

  const cancel = useCallback(() => {
    if (phaseRef.current !== "holding" && phaseRef.current !== "ready") return;
    window.clearTimeout(holdTimer.current);
    setPhase("idle");
  }, [setPhase]);

  const stop = useCallback(() => {
    if (phaseRef.current !== "running") return;
    const ms = Math.round(performance.now() - startRef.current);
    setShown(ms);
    setPhase("idle");
    add(ms, scrambleRef.current ?? "");
    shuffle();
  }, [add, setPhase, shuffle]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (phaseRef.current === "running") {
        if (MODIFIER_KEYS.has(e.key)) return;
        e.preventDefault();
        stop();
      } else if (e.code === "Space") {
        // Also keeps Space from scrolling or pressing a focused button.
        e.preventDefault();
        // Holding Space after a stop repeats keydown; only a fresh press arms.
        if (!e.repeat) press();
      } else if (e.key === "Escape") {
        cancel();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== "Space") return;
      e.preventDefault();
      release();
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", cancel);
      window.clearTimeout(holdTimer.current);
    };
  }, [press, release, cancel, stop]);

  // Count up on screen while running.
  useEffect(() => {
    if (phase !== "running") return;
    let frame = requestAnimationFrame(function tick() {
      setShown(performance.now() - startRef.current);
      frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  const time = <span className={`font-mono tabular-nums ${PHASE_COLOR[phase]}`}>{formatTime(shown)}</span>;
  const stats: [string, number | undefined][] = [
    [t("timer.best"), best(solves)],
    ["ao5", averageOf(solves, 5)],
    ["ao12", averageOf(solves, 12)],
  ];

  return (
    <>
      <section aria-label={t("timer.scramble")} className="mt-2 rounded-xl border border-line bg-surface p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-muted">{t("timer.scramble")}</h2>
          <button className="btn text-sm" onClick={shuffle} disabled={phase !== "idle"}>
            {t("timer.newScramble")}
          </button>
        </div>
        <p className="mt-2 min-h-[2lh] font-mono text-lg break-words sm:text-xl">{scramble}</p>
        <div className="mt-3">
          {scrambled ? <Cube start={scrambled} moves={NO_MOVES} position={0} /> : <div className={CUBE_BOX} />}
        </div>
      </section>

      <div
        role="timer"
        aria-label={t("timer.title")}
        onPointerDown={(e) => {
          if (e.isPrimary && e.button === 0) press();
        }}
        onPointerUp={release}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
        className="mt-3 flex h-52 cursor-pointer touch-none flex-col items-center justify-center rounded-xl border border-line bg-surface select-none [-webkit-tap-highlight-color:transparent] sm:h-60"
      >
        <div className="text-6xl font-bold sm:text-7xl">{time}</div>
        <p className="mt-3 max-w-md px-4 text-center text-sm text-muted">{t("timer.hint")}</p>
      </div>

      {/* While running, the time fills the screen and any tap stops it. */}
      {(phase === "running" || overlayHeld) && (
        <div
          onPointerDown={() => {
            if (phaseRef.current !== "running") return;
            setOverlayHeld(true);
            stop();
          }}
          onClick={() => setOverlayHeld(false)}
          onPointerCancel={() => setOverlayHeld(false)}
          className="fixed inset-0 z-[60] flex cursor-pointer touch-none flex-col items-center justify-center bg-bg select-none"
        >
          <div className="text-7xl font-bold sm:text-9xl">{time}</div>
          <p className="mt-4 text-sm text-muted">{t("timer.stopHint")}</p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        {stats.map(([label, ms]) => (
          <div key={label} className="rounded-xl border border-line bg-surface p-2">
            <dt className="text-xs text-muted">{label}</dt>
            <dd className="font-mono text-xl font-bold tabular-nums">{ms === undefined ? "–" : formatTime(ms)}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">
            {t("timer.history")} <span className="text-sm font-normal text-muted">{solves.length}</span>
          </h2>
          {solves.length > 0 && (
            <button
              className="btn text-sm"
              onClick={() => {
                if (window.confirm(t("timer.clearConfirm", { count: solves.length }))) clear();
              }}
            >
              {t("timer.clear")}
            </button>
          )}
        </div>
        {solves.length === 0 ? (
          <p className="mt-2 text-muted">{t("timer.empty")}</p>
        ) : (
          <ol className="mt-2 divide-y divide-line rounded-xl border border-line bg-surface">
            {solves
              .map((s, i) => ({ ...s, n: i + 1 }))
              .reverse()
              .map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="w-8 shrink-0 text-right text-sm text-muted tabular-nums">{s.n}</span>
                  <span className="w-20 shrink-0 font-mono font-bold tabular-nums">{formatTime(s.ms)}</span>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted" title={s.scramble}>
                    {s.scramble}
                  </span>
                  <button
                    className="shrink-0 cursor-pointer rounded-md px-2 py-0.5 text-muted hover:text-ink"
                    aria-label={t("timer.delete", { time: formatTime(s.ms) })}
                    onClick={() => remove(s.id)}
                  >
                    ×
                  </button>
                </li>
              ))}
          </ol>
        )}
      </section>
    </>
  );
}
