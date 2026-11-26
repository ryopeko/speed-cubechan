"use client";

import { useCallback, useSyncExternalStore } from "react";

/** One timed solve. */
export type Solve = {
  id: string;
  /** Time in milliseconds. */
  ms: number;
  scramble: string;
  /** When it was finished, as Date.now(). */
  at: number;
};
/** All solves, oldest first. */
export type Solves = readonly Solve[];

// The solves, kept in localStorage as a JSON array.
const KEY = "speed-cubechan:solves";
const EMPTY: Solves = [];
const listeners = new Set<() => void>();

const isSolve = (v: unknown): v is Solve => {
  if (!v || typeof v !== "object") return false;
  const s = v as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.ms === "number" &&
    Number.isFinite(s.ms) &&
    s.ms >= 0 &&
    typeof s.scramble === "string" &&
    typeof s.at === "number"
  );
};

/** Parse the stored solves, dropping entries that are not solves. */
export function parseSolves(raw: string | null): Solves {
  if (raw === null) return EMPTY;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY;
    return parsed.filter(isSolve).map(({ id, ms, scramble, at }) => ({ id, ms, scramble, at }));
  } catch {
    // Broken JSON: start over.
    return EMPTY;
  }
}

// ---------------------------------------------------------------------------
// Statistics

/** The fastest time, or undefined with no solves. */
export function best(solves: Solves): number | undefined {
  return solves.length ? Math.min(...solves.map((s) => s.ms)) : undefined;
}

/**
 * The average of the latest `n` solves (ao5, ao12): the fastest and the
 * slowest are dropped and the rest are averaged. Undefined with fewer than n.
 */
export function averageOf(solves: Solves, n: number): number | undefined {
  if (n < 3 || solves.length < n) return undefined;
  const times = solves
    .slice(-n)
    .map((s) => s.ms)
    .sort((a, b) => a - b)
    .slice(1, -1);
  return times.reduce((sum, t) => sum + t, 0) / times.length;
}

/** A time as shown: "9.87", "12.34", "1:02.34". Hundredths are cut, not rounded. */
export function formatTime(ms: number): string {
  const cs = Math.floor(ms / 10);
  const minutes = Math.floor(cs / 6000);
  const seconds = Math.floor((cs % 6000) / 100);
  const hundredths = String(cs % 100).padStart(2, "0");
  return minutes > 0
    ? `${minutes}:${String(seconds).padStart(2, "0")}.${hundredths}`
    : `${seconds}.${hundredths}`;
}

// ---------------------------------------------------------------------------
// Storage

let cachedRaw: string | null = null;
let cached: Solves = EMPTY;

function read(): Solves {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cached = parseSolves(raw);
  }
  return cached;
}

function write(solves: Solves) {
  try {
    localStorage.setItem(KEY, JSON.stringify(solves));
  } catch {
    // Storage may be unavailable (private mode); keep the change in memory.
    cachedRaw = null;
    cached = solves;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function useSolves() {
  const solves = useSyncExternalStore(subscribe, read, () => EMPTY);
  const add = useCallback((ms: number, scramble: string) => {
    write([...read(), { id: newId(), ms, scramble, at: Date.now() }]);
  }, []);
  const remove = useCallback((id: string) => {
    write(read().filter((s) => s.id !== id));
  }, []);
  const clear = useCallback(() => write(EMPTY), []);
  return { solves, add, remove, clear };
}
