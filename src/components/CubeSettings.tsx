"use client";

import { useState } from "react";
import {
  BACKGROUNDS,
  type BackgroundId,
  CONTRAST_RANGE,
  DEFAULT_PREFS,
  LIGHT_RANGE,
  useCubePrefs,
} from "@/lib/cubePrefs";

/** A ⚙ button over the cube view that opens background, grid, and lighting settings. */
export default function CubeSettings() {
  const [open, setOpen] = useState(false);
  const [prefs, update] = useCubePrefs();
  const { bg, grid, light, contrast } = prefs;

  return (
    <div className="absolute right-2 bottom-2 flex flex-col items-end gap-1.5">
      {open && (
        <div className="flex w-56 flex-col gap-2.5 rounded-lg bg-surface/90 p-3 text-sm shadow-md backdrop-blur">
          <div className="flex items-center gap-1.5">
            <span className="mr-auto text-muted">背景</span>
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
          </div>

          <label className="flex items-center justify-between">
            <span className="text-muted">床のグリッド</span>
            <input
              type="checkbox"
              checked={grid}
              onChange={(e) => update({ grid: e.target.checked })}
              className="size-4 accent-accent"
            />
          </label>

          <Slider
            label="光の強さ"
            value={light}
            display={light.toFixed(1)}
            range={LIGHT_RANGE}
            onChange={(v) => update({ light: v })}
          />
          <Slider
            label="コントラスト"
            value={contrast}
            display={`${Math.round(contrast * 100)}`}
            range={CONTRAST_RANGE}
            onChange={(v) => update({ contrast: v })}
          />

          <button
            className="self-start cursor-pointer text-xs text-accent hover:underline"
            onClick={() => update({ light: DEFAULT_PREFS.light, contrast: DEFAULT_PREFS.contrast })}
          >
            光を元に戻す
          </button>
        </div>
      )}
      <button
        aria-expanded={open}
        aria-label="表示の設定"
        title="表示の設定"
        onClick={() => setOpen((o) => !o)}
        className="grid size-8 cursor-pointer place-items-center rounded-lg bg-surface/85 text-muted shadow-sm backdrop-blur hover:text-ink aria-expanded:text-accent"
      >
        ⚙
      </button>
    </div>
  );
}

function Slider({
  label,
  value,
  display,
  range,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  range: { min: number; max: number; step: number };
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="flex justify-between">
        <span className="text-muted">{label}</span>
        <span className="font-mono tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        {...range}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </label>
  );
}
