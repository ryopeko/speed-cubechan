import { describe, expect, it } from "vitest";
import type { Pattern } from "@/data/patterns";
import type { Solve } from "./solves";
import { progressOf, solveSummary } from "./status";

const pattern = (id: string): Pattern => ({ id, kind: "OLL", name: id, alg: "R U R'" });

describe("progressOf", () => {
  const patterns = ["a", "b", "c", "d"].map(pattern);

  it("counts the patterns by status", () => {
    expect(progressOf(patterns, { a: "learned", b: "practicing", c: "learned" })).toEqual({
      total: 4,
      learned: 2,
      practicing: 1,
      none: 1,
    });
  });

  it("ignores marks for other patterns", () => {
    expect(progressOf(patterns, { x: "learned", y: "practicing" })).toEqual({
      total: 4,
      learned: 0,
      practicing: 0,
      none: 4,
    });
  });
});

describe("solveSummary", () => {
  const solve = (ms: number, at: number): Solve => ({ id: String(at), ms, scramble: "", at });

  it("has only the count with no solves", () => {
    expect(solveSummary([])).toEqual({ count: 0 });
  });

  it("summarizes the solves", () => {
    const solves = [12000, 10000, 11000, 15000, 9000].map((ms, i) => solve(ms, 100 + i));
    expect(solveSummary(solves)).toEqual({ count: 5, best: 9000, ao5: 11000, ao12: undefined, lastAt: 104 });
  });
});
