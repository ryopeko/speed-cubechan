"use client";

import { useCallback, useSyncExternalStore } from "react";

// Ids of the patterns marked as learned, kept in localStorage.
const KEY = "speed-cubechan:marked";
const EMPTY: readonly string[] = [];
const listeners = new Set<() => void>();

let cachedRaw: string | null = null;
let cached: readonly string[] = EMPTY;

function read(): readonly string[] {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cached = Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : EMPTY;
    } catch {
      cached = EMPTY;
    }
  }
  return cached;
}

function write(ids: readonly string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable (private mode); keep the change in memory.
    cachedRaw = null;
    cached = ids;
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useMarks() {
  const marked = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((id: string) => {
    const cur = read();
    write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
  }, []);
  return { marked, isMarked: (id: string) => marked.includes(id), toggle };
}
