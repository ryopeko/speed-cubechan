import { describe, expect, it } from "vitest";
import { LANG_INIT_SCRIPT, LANG_KEY, LANG_PENDING_ATTR, pickLang } from "./lang";

describe("pickLang", () => {
  it("prefers ?lang=", () => {
    expect(pickLang("ja", "en", ["en-US"])).toBe("ja");
    expect(pickLang("en", "ja", ["ja"])).toBe("en");
  });

  it("then the saved choice", () => {
    expect(pickLang(null, "ja", ["en-US"])).toBe("ja");
    expect(pickLang("fr", "en", ["ja-JP"])).toBe("en");
  });

  it("then the browser's first language", () => {
    expect(pickLang(null, null, ["ja"])).toBe("ja");
    expect(pickLang(null, null, ["ja-JP", "en"])).toBe("ja");
    expect(pickLang(null, null, ["en-US", "ja"])).toBe("en");
    expect(pickLang(null, "garbage", ["JA-jp"])).toBe("ja");
  });

  it("falls back to English", () => {
    expect(pickLang(null, null, [])).toBe("en");
    expect(pickLang(null, null, ["fr-FR"])).toBe("en");
    expect(pickLang(null, null, ["jav"])).toBe("en");
  });
});

/** Run the inline script against a fake page. */
function runInit({ search = "", stored = null as string | null, languages = ["en-US"] }) {
  const storage = new Map<string, string>();
  if (stored !== null) storage.set(LANG_KEY, stored);
  const attrs = new Set<string>();
  const html = {
    lang: "en",
    setAttribute: (name: string) => attrs.add(name),
    removeAttribute: (name: string) => attrs.delete(name),
  };
  const run = new Function("location", "localStorage", "navigator", "document", "setTimeout", LANG_INIT_SCRIPT);
  run(
    { search },
    { getItem: (k: string) => storage.get(k) ?? null, setItem: (k: string, v: string) => storage.set(k, v) },
    { languages },
    { documentElement: html },
    () => 0,
  );
  return { lang: html.lang, saved: storage.get(LANG_KEY), pending: attrs.has(LANG_PENDING_ATTR) };
}

describe("LANG_INIT_SCRIPT", () => {
  it("leaves an English page alone", () => {
    expect(runInit({})).toEqual({ lang: "en", saved: undefined, pending: false });
  });

  it("switches to the browser's Japanese and hides the page until rendered", () => {
    expect(runInit({ languages: ["ja-JP"] })).toEqual({ lang: "ja", saved: undefined, pending: true });
  });

  it("saves a ?lang= choice", () => {
    expect(runInit({ search: "?lang=ja" })).toEqual({ lang: "ja", saved: "ja", pending: true });
    expect(runInit({ search: "?lang=en", stored: "ja", languages: ["ja"] })).toEqual({
      lang: "en",
      saved: "en",
      pending: false,
    });
  });
});
