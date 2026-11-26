"use client";

import { TERMS, TERMS_UPDATED } from "@/content/terms";
import { useLang } from "@/i18n/useLang";

/** The Terms of Service body, in the shown language. */
export default function Terms() {
  const terms = TERMS[useLang()];
  return (
    <div className="space-y-6">
      <p>{terms.intro}</p>
      {terms.sections.map((section) => (
        <section key={section.heading}>
          <h2 className="mb-2 text-lg font-bold">{section.heading}</h2>
          {section.paragraphs.map((p) => (
            <p key={p} className="mb-2">
              {p}
            </p>
          ))}
        </section>
      ))}
      <p className="text-sm text-muted">{terms.updated.replace("{date}", TERMS_UPDATED)}</p>
    </div>
  );
}
