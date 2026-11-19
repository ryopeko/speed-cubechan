"use client";

import type { MessageKey } from "@/i18n/messages";
import { useT } from "@/i18n/useLang";
import { useMarks, type MarkStatus } from "@/lib/marks";

const OPTIONS: readonly { value: MarkStatus; label: MessageKey; selected: string }[] = [
  { value: "none", label: "status.none", selected: "aria-checked:bg-line aria-checked:text-ink" },
  { value: "practicing", label: "status.practicing", selected: "aria-checked:bg-practice aria-checked:text-white" },
  { value: "learned", label: "status.learnedMark", selected: "aria-checked:bg-mark aria-checked:text-white" },
];

/** Picks a pattern's status: not yet, practicing, or learned. */
export default function MarkButton({ id }: { id: string }) {
  const { statusOf, setStatus } = useMarks();
  const status = statusOf(id);
  const t = useT();
  return (
    <div
      role="radiogroup"
      aria-label={t("status.label")}
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
          {t(o.label)}
        </button>
      ))}
    </div>
  );
}
