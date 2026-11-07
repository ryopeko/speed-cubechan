"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Backgrounds to try behind the 3D cube. `dark` makes the floor grid lines light. */
export const BACKGROUNDS = {
  greige: { label: "グレージュ", color: "#e3dfd6", dark: false },
  gray: { label: "グレー", color: "#d3d5d8", dark: false },
  mat: { label: "マット", color: "#33322f", dark: true },
  white: { label: "白", color: "#fffefb", dark: false },
} as const;

export type BackgroundId = keyof typeof BACKGROUNDS;
export type CubeBackground = { bg: BackgroundId; grid: boolean };

const KEY = "speed-cubechan:cube-background";
const DEFAULT: CubeBackground = { bg: "greige", grid: false };
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cached: CubeBackground = DEFAULT;

function read(): CubeBackground {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return cached;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      const v = raw ? JSON.parse(raw) : {};
      cached = {
        bg: v.bg in BACKGROUNDS ? v.bg : DEFAULT.bg,
        grid: typeof v.grid === "boolean" ? v.grid : DEFAULT.grid,
      };
    } catch {
      cached = DEFAULT;
    }
  }
  return cached;
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

/** The chosen cube background, saved in localStorage and shared by every cube view. */
export function useCubeBackground() {
  const value = useSyncExternalStore(subscribe, read, () => DEFAULT);
  const update = useCallback((patch: Partial<CubeBackground>) => {
    const next = { ...read(), ...patch };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      cachedRaw = undefined;
      cached = next;
    }
    listeners.forEach((l) => l());
  }, []);
  return [value, update] as const;
}

/** Inline style for the box behind the cube. (The grid is drawn in 3D by the cube view.) */
export function backgroundStyle({ bg }: CubeBackground): React.CSSProperties {
  return { backgroundColor: BACKGROUNDS[bg].color };
}
