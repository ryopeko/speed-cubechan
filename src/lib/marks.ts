"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Where a pattern is in learning. Patterns with no entry are "none" (not yet). */
export type MarkStatus = "none" | "practicing" | "learned";
/** Pattern id -> status, for the patterns that have one. */
export type Marks = Readonly<Record<string, Exclude<MarkStatus, "none">>>;

// The statuses, kept in localStorage as a JSON object.
const KEY = "speed-cubechan:status";
// The old format: a JSON array of the ids marked as learned. Read only when KEY is absent.
const LEGACY_KEY = "speed-cubechan:marked";
const EMPTY: Marks = {};
const listeners = new Set<() => void>();

/** Parse the stored statuses, falling back to the old learned-only list. */
export function parseMarks(raw: string | null, legacyRaw: string | null): Marks {
  try {
    if (raw !== null) {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
      const marks: Record<string, Exclude<MarkStatus, "none">> = {};
      for (const [id, status] of Object.entries(parsed)) {
        if (status === "practicing" || status === "learned") marks[id] = status;
      }
      return marks;
    }
    if (legacyRaw) {
      const parsed: unknown = JSON.parse(legacyRaw);
      if (!Array.isArray(parsed)) return EMPTY;
      const marks: Record<string, Exclude<MarkStatus, "none">> = {};
      for (const id of parsed) if (typeof id === "string") marks[id] = "learned";
      return marks;
    }
  } catch {
    // Broken JSON: start over.
  }
  return EMPTY;
}

/** The marks with one pattern's status changed; "none" removes the entry. */
export function withStatus(marks: Marks, id: string, status: MarkStatus): Marks {
  const next = { ...marks };
  if (status === "none") delete next[id];
  else next[id] = status;
  return next;
}

let cachedRaw: string | null = null;
let cachedLegacyRaw: string | null = null;
let cached: Marks = EMPTY;

function read(): Marks {
  let raw: string | null = null;
  let legacyRaw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    legacyRaw = raw === null ? localStorage.getItem(LEGACY_KEY) : null;
  } catch {
    return cached;
  }
  if (raw !== cachedRaw || legacyRaw !== cachedLegacyRaw) {
    cachedRaw = raw;
    cachedLegacyRaw = legacyRaw;
    cached = parseMarks(raw, legacyRaw);
  }
  return cached;
}

function write(marks: Marks) {
  try {
    localStorage.setItem(KEY, JSON.stringify(marks));
  } catch {
    // Storage may be unavailable (private mode); keep the change in memory.
    cachedRaw = null;
    cachedLegacyRaw = null;
    cached = marks;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY || e.key === LEGACY_KEY || e.key === null) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMarks() {
  const marks = useSyncExternalStore(subscribe, read, () => EMPTY);
  const setStatus = useCallback((id: string, status: MarkStatus) => {
    write(withStatus(read(), id, status));
  }, []);
  return {
    marks,
    statusOf: (id: string): MarkStatus => marks[id] ?? "none",
    setStatus,
  };
}
