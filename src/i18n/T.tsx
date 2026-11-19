"use client";

import { useEffect } from "react";
import type { MessageKey, MessageVars } from "./messages";
import { useT } from "./useLang";

/** A message as text, for use in Server Components. */
export default function T({ k, vars }: { k: MessageKey; vars?: MessageVars }) {
  return useT()(k, vars);
}

/**
 * Sets document.title to a message. The <title> in the static HTML is
 * English (it is what link previews read); this follows the shown language.
 */
export function DocTitle({ k, vars }: { k: MessageKey; vars?: MessageVars }) {
  const title = useT()(k, vars);
  useEffect(() => {
    const apply = () => {
      if (document.title !== title) document.title = title;
    };
    apply();
    // Next writes the metadata's <title> after this runs, so keep putting ours back.
    const observer = new MutationObserver(apply);
    observer.observe(document.head, { subtree: true, childList: true, characterData: true });
    return () => observer.disconnect();
  }, [title]);
  return null;
}
