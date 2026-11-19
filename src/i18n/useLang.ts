"use client";

import { useCallback, useSyncExternalStore } from "react";
import { LANG_KEY } from "./lang";
import { type Lang, type MessageKey, type MessageVars, translate } from "./messages";

/*
 * The language in the browser. LANG_INIT_SCRIPT has already set <html lang>
 * by the time this runs, so that is the source of truth. The server (and
 * hydration) render English; components re-render once hydrated.
 */

const listeners = new Set<() => void>();

/** The current language, for code outside React rendering. */
export const currentLang = (): Lang => (document.documentElement.lang === "ja" ? "ja" : "en");

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Switch the language: saved, and reflected in the address bar as ?lang=. */
export function setLang(lang: Lang) {
  document.documentElement.lang = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    // Storage may be unavailable (private mode); ?lang= still carries it.
  }
  const url = new URL(location.href);
  url.searchParams.set("lang", lang);
  history.replaceState(history.state, "", url);
  listeners.forEach((l) => l());
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, currentLang, () => "en");
}

/** `t(key, vars)` in the current language. */
export function useT() {
  const lang = useLang();
  return useCallback((key: MessageKey, vars?: MessageVars) => translate(lang, key, vars), [lang]);
}
