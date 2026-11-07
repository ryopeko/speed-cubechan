"use client";

import { useMarks } from "@/lib/marks";

/** A checkbox for "learned": checked means the pattern is marked. */
export default function MarkButton({ id }: { id: string }) {
  const { isMarked, toggle } = useMarks();
  const marked = isMarked(id);
  return (
    <button
      role="checkbox"
      aria-checked={marked}
      onClick={() => toggle(id)}
      className={`btn flex shrink-0 items-center gap-1.5 whitespace-nowrap ${marked ? "font-semibold text-mark!" : "text-muted"}`}
    >
      <span
        aria-hidden
        className={`grid size-4 place-items-center rounded border-2 text-[11px] leading-none font-bold ${
          marked ? "border-mark bg-mark text-white" : "border-muted/60"
        }`}
      >
        {marked ? "✓" : ""}
      </span>
      覚えた
    </button>
  );
}
