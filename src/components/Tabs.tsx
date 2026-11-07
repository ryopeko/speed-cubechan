"use client";

export default function Tabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [T, string])[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5" role="tablist">
      {options.map(([v, label]) => (
        <button
          key={v}
          role="tab"
          className="tab"
          aria-selected={value === v}
          onClick={() => onChange(v)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
