"use client";

import { useEffect, useRef, useState } from "react";

/**
 * An icon button that opens a small menu: copy the link, or post it to X.
 * Copying shows a short notice at the bottom of the screen.
 */
export default function ShareButton({ url, title }: { url: string; title: string }) {
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  // Close on a click outside or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Hide the notice after a moment.
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  const copyLink = async () => {
    setOpen(false);
    try {
      await navigator.clipboard.writeText(url);
      setNotice("リンクをコピーしました");
    } catch {
      setNotice("コピーできませんでした");
    }
  };

  const xUrl = `https://x.com/intent/post?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
  const item =
    "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-ink no-underline hover:bg-bg";

  return (
    <div ref={ref} className="relative">
      <button
        className="btn grid size-10 place-items-center p-0! aria-expanded:border-accent aria-expanded:text-accent"
        aria-label="共有"
        title="共有"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <ShareIcon />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1.5 flex w-48 flex-col rounded-lg border border-line bg-surface p-1 shadow-md"
        >
          <button role="menuitem" className={item} onClick={copyLink}>
            <LinkIcon />
            リンクをコピー
          </button>
          <a
            role="menuitem"
            className={item}
            href={xUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <XIcon />X でポスト
          </a>
        </div>
      )}
      {/* Kept mounted so screen readers announce changes. */}
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center transition-opacity duration-200 ${
          notice ? "opacity-100" : "opacity-0"
        }`}
      >
        {notice && (
          <span className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-bg shadow-lg">
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

/** A box with an arrow leaving it upwards. */
function ShareIcon() {
  return (
    <svg {...iconProps} className="size-5">
      <path d="M12 3v12" />
      <path d="m7.5 7.5 4.5-4.5 4.5 4.5" />
      <path d="M8 10H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg {...iconProps} className="size-4 text-muted">
      <path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1 1" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1-1" />
    </svg>
  );
}

/** The X letter mark. */
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4 text-muted">
      <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43Z" />
    </svg>
  );
}
