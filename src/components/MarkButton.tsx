"use client";

import { useMarks, type MarkStatus } from "@/lib/marks";

const OPTIONS: readonly { value: MarkStatus; label: string; selected: string }[] = [
  { value: "none", label: "まだ", selected: "aria-checked:bg-line aria-checked:text-ink" },
  { value: "practicing", label: "練習中", selected: "aria-checked:bg-practice aria-checked:text-white" },
  { value: "learned", label: "✓ 覚えた", selected: "aria-checked:bg-mark aria-checked:text-white" },
];

/** Picks a pattern's status: まだ, 練習中, or 覚えた. */
export default function MarkButton({ id }: { id: string }) {
  const { statusOf, setStatus } = useMarks();
  const status = statusOf(id);
  return (
    <div
      role="radiogroup"
      aria-label="覚えた状態"
      className="inline-grid shrink-0 grid-flow-col gap-1 rounded-xl border border-line bg-surface p-1"
    >
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={status === o.value}
          onClick={() => setStatus(id, o.value)}
          className={`cursor-pointer rounded-lg px-3 py-1 text-sm whitespace-nowrap text-muted transition-colors hover:not-aria-checked:text-ink aria-checked:font-semibold ${o.selected}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
