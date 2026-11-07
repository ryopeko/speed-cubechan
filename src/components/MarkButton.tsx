"use client";

import { useMarks } from "@/lib/marks";

export default function MarkButton({ id }: { id: string }) {
  const { isMarked, toggle } = useMarks();
  const marked = isMarked(id);
  return (
    <button
      className={marked ? "mark marked" : "mark"}
      aria-pressed={marked}
      onClick={() => toggle(id)}
    >
      {marked ? "★ 覚えた" : "☆ 未"}
    </button>
  );
}
