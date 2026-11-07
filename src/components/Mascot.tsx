"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import cubechan from "@/assets/cubechan.png";
import cubechanDopa from "@/assets/cubechan-dopa.png";
import { onDopaEvent, setDopa, useDopa } from "@/lib/dopa";

const PLACE = "fixed right-3 bottom-3 z-50 sm:right-5 sm:bottom-5";

/**
 * The mascot in the bottom-right corner. On a pattern page it is also the
 * hidden switch for ドパモード; elsewhere it ignores taps.
 */
export default function Mascot() {
  const onPattern = usePathname().startsWith("/patterns/");
  const dopa = useDopa();
  const active = dopa && onPattern;
  // Bumped on every effect so the jump animation restarts.
  const [jump, setJump] = useState(0);

  // The mode belongs to pattern pages: leaving one turns it off.
  useEffect(() => {
    if (!onPattern) setDopa(false);
  }, [onPattern]);

  useEffect(() => {
    document.documentElement.toggleAttribute("data-dopa", active);
  }, [active]);

  useEffect(() => onDopaEvent(() => setJump((j) => j + 1)), []);

  if (!onPattern) {
    return (
      <Image
        src={cubechan}
        alt=""
        aria-hidden
        className={`${PLACE} pointer-events-none w-20 drop-shadow-md select-none sm:w-28`}
      />
    );
  }

  return (
    <button
      aria-pressed={active}
      aria-label="キュービちゃん"
      onClick={() => setDopa(!dopa)}
      className={`${PLACE} cursor-pointer select-none [-webkit-tap-highlight-color:transparent]`}
    >
      <Image
        key={active ? `dopa-${jump}` : "plain"}
        src={active ? cubechanDopa : cubechan}
        alt=""
        className={
          active
            ? "pointer-events-none w-28 animate-dopa-jump drop-shadow-[0_0_18px_rgba(255,43,214,0.8)] sm:w-40"
            : "pointer-events-none w-20 drop-shadow-md transition-transform hover:-rotate-6 active:scale-95 sm:w-28"
        }
      />
    </button>
  );
}
