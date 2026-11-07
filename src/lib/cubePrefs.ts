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

/** Range of the light and contrast sliders. */
export const LIGHT_RANGE = { min: 0.5, max: 5, step: 0.1 };
export const CONTRAST_RANGE = { min: 0, max: 1, step: 0.05 };

/** How the 3D cube is shown. Shared by every cube view and saved in localStorage. */
export type CubePrefs = {
  bg: BackgroundId;
  grid: boolean;
  /** Intensity of the front key light. */
  light: number;
  /** 0 = flat (bright shadows) … 1 = strong (dark shadows). 0.5 is the default look. */
  contrast: number;
};

export const DEFAULT_PREFS: CubePrefs = { bg: "greige", grid: false, light: 2.5, contrast: 0.5 };

// Kept from when this only stored the background, so a saved choice survives.
const KEY = "speed-cubechan:cube-background";
const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cached: CubePrefs = DEFAULT_PREFS;

const inRange = (v: unknown, { min, max }: { min: number; max: number }) =>
  typeof v === "number" && v >= min && v <= max;

function read(): CubePrefs {
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
        bg: v.bg in BACKGROUNDS ? v.bg : DEFAULT_PREFS.bg,
        grid: typeof v.grid === "boolean" ? v.grid : DEFAULT_PREFS.grid,
        light: inRange(v.light, LIGHT_RANGE) ? v.light : DEFAULT_PREFS.light,
        contrast: inRange(v.contrast, CONTRAST_RANGE) ? v.contrast : DEFAULT_PREFS.contrast,
      };
    } catch {
      cached = DEFAULT_PREFS;
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

export function useCubePrefs() {
  const value = useSyncExternalStore(subscribe, read, () => DEFAULT_PREFS);
  const update = useCallback((patch: Partial<CubePrefs>) => {
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
export function backgroundStyle({ bg }: CubePrefs): React.CSSProperties {
  return { backgroundColor: BACKGROUNDS[bg].color };
}
