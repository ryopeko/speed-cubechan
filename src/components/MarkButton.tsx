"use client";

import { useMarks } from "@/lib/marks";

export default function MarkButton({ id }: { id: string }) {
  const { isMarked, toggle } = useMarks();
  const marked = isMarked(id);
  return (
    <button
      className={`btn shrink-0 whitespace-nowrap ${marked ? "border-mark! font-semibold text-mark!" : "text-muted"}`}
      aria-pressed={marked}
      onClick={() => toggle(id)}
    >
      {marked ? "★ 覚えた" : "☆ 未"}
    </button>
  );
}
