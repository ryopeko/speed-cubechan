import { describe, expect, it } from "vitest";
import { MESSAGES, translate } from "./messages";

describe("messages", () => {
  it("has the same keys in every language", () => {
    expect(Object.keys(MESSAGES.ja).sort()).toEqual(Object.keys(MESSAGES.en).sort());
  });

  it("uses the same placeholders in every language", () => {
    const vars = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
    for (const key of Object.keys(MESSAGES.en) as (keyof typeof MESSAGES.en)[]) {
      expect(vars(MESSAGES.ja[key]), key).toEqual(vars(MESSAGES.en[key]));
    }
  });
});

describe("translate", () => {
  it("fills in the placeholders", () => {
    expect(translate("en", "player.progress", { position: 2, total: 9 })).toBe("2 / 9 moves");
    expect(translate("ja", "pattern.title", { name: "OLL 1" })).toBe("OLL 1 | スピードキュービちゃん");
  });

  it("leaves unknown placeholders as they are", () => {
    expect(translate("en", "pattern.title")).toBe("{name} | Speed Cube-chan");
  });
});
