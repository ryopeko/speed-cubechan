import { describe, expect, it } from "vitest";
import { parseMarks, withStatus } from "./marks";

describe("parseMarks", () => {
  it("reads the stored statuses", () => {
    expect(parseMarks('{"oll-1":"learned","pll-t":"practicing"}', null)).toEqual({
      "oll-1": "learned",
      "pll-t": "practicing",
    });
  });

  it("drops unknown statuses", () => {
    expect(parseMarks('{"a":"learned","b":"none","c":1}', null)).toEqual({ a: "learned" });
  });

  it("treats the old learned-only list as learned", () => {
    expect(parseMarks(null, '["a","b",3]')).toEqual({ a: "learned", b: "learned" });
  });

  it("ignores the old list once the new one exists", () => {
    expect(parseMarks("{}", '["a"]')).toEqual({});
  });

  it("returns nothing for missing or broken data", () => {
    expect(parseMarks(null, null)).toEqual({});
    expect(parseMarks("{broken", null)).toEqual({});
    expect(parseMarks("[1]", null)).toEqual({});
    expect(parseMarks(null, '{"a":1}')).toEqual({});
  });
});

describe("withStatus", () => {
  it("sets, changes, and clears a status without touching the input", () => {
    const start = { a: "learned" } as const;
    const practicing = withStatus(start, "b", "practicing");
    expect(practicing).toEqual({ a: "learned", b: "practicing" });
    expect(withStatus(practicing, "b", "learned")).toEqual({ a: "learned", b: "learned" });
    expect(withStatus(practicing, "a", "none")).toEqual({ b: "practicing" });
    expect(start).toEqual({ a: "learned" });
  });
});
