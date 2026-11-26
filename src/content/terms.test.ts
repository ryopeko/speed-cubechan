import { describe, expect, it } from "vitest";
import { TERMS } from "./terms";

describe("terms", () => {
  it("has the same number of sections and paragraphs in every language", () => {
    const shape = (lang: keyof typeof TERMS) => TERMS[lang].sections.map((s) => s.paragraphs.length);
    expect(shape("en")).toEqual(shape("ja"));
  });

  it("fills in the date in every language", () => {
    for (const terms of Object.values(TERMS)) expect(terms.updated).toContain("{date}");
  });
});
