"use client";

/**
 * A joined row of options with a count on each, like iOS's segmented control.
 * Fills the width on phones so each option is an easy tap target.
 */
export default function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: readonly { value: T; label: string; count: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="grid auto-cols-fr grid-flow-col gap-1 rounded-xl border border-line bg-surface p-1 sm:inline-grid"
    >
      {options.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className="group flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-1.5 whitespace-nowrap text-muted transition-colors hover:text-ink aria-selected:bg-accent aria-selected:font-semibold aria-selected:text-white"
        >
          {o.label}
          <span className="min-w-[1.75em] rounded-full bg-line/70 px-1.5 text-center text-xs leading-5 font-normal tabular-nums group-aria-selected:bg-white/25">
            {o.count}
          </span>
        </button>
      ))}
    </div>
  );
}
