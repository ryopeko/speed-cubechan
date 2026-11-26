"use client";

import { useEffect } from "react";
import { LANG_PENDING_ATTR } from "@/i18n/lang";
import { LANGS } from "@/i18n/messages";
import { setLang, useLang, useT } from "@/i18n/useLang";

const LABELS = { en: "EN", ja: "JA" } as const;

/** EN / JA buttons in the header. Also shows the page once it is in the picked language. */
export default function LangSwitch() {
  const lang = useLang();
  const t = useT();

  // Hydration renders English; this runs again after the re-render in the
  // picked language, which is when the page can be shown.
  useEffect(() => {
    if (document.documentElement.lang === lang) document.documentElement.removeAttribute(LANG_PENDING_ATTR);
  }, [lang]);

  return (
    <div role="group" aria-label={t("lang.label")} className="flex gap-0.5 rounded-lg border border-line p-0.5 text-xs">
      {LANGS.map((l) => (
        <button
          key={l}
          lang={l}
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className="cursor-pointer rounded-md px-2 py-1 font-semibold text-muted hover:not-aria-pressed:text-ink aria-pressed:bg-accent aria-pressed:text-white"
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}
