"use client";

import { BACKGROUNDS, type BackgroundId, useCubeBackground } from "@/lib/cubeBackground";

/** Small swatches over the cube view for trying backgrounds and the grid. */
export default function BackgroundPicker() {
  const [{ bg, grid }, update] = useCubeBackground();
  return (
    <div className="absolute right-2 bottom-2 flex items-center gap-1.5 rounded-lg bg-surface/85 px-2 py-1.5 shadow-sm backdrop-blur">
      {(Object.keys(BACKGROUNDS) as BackgroundId[]).map((id) => (
        <button
          key={id}
          title={BACKGROUNDS[id].label}
          aria-label={`背景: ${BACKGROUNDS[id].label}`}
          aria-pressed={bg === id}
          onClick={() => update({ bg: id })}
          className="size-5 cursor-pointer rounded-full border border-line aria-pressed:ring-2 aria-pressed:ring-accent aria-pressed:ring-offset-1"
          style={{ backgroundColor: BACKGROUNDS[id].color }}
        />
      ))}
      <button
        aria-pressed={grid}
        onClick={() => update({ grid: !grid })}
        className="ml-1 cursor-pointer rounded-md border border-line px-1.5 text-xs text-muted aria-pressed:border-accent aria-pressed:text-accent"
      >
        グリッド
      </button>
    </div>
  );
}
