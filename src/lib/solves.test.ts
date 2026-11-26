import { describe, expect, it } from "vitest";
import { averageOf, best, formatTime, parseSolves, type Solve } from "./solves";

const solves = (...ms: number[]): Solve[] => ms.map((t, i) => ({ id: String(i), ms: t, scramble: "R U", at: i }));

describe("parseSolves", () => {
  it("reads the stored solves", () => {
    const stored = solves(12340, 9870);
    expect(parseSolves(JSON.stringify(stored))).toEqual(stored);
  });

  it("drops entries that are not solves", () => {
    const raw = JSON.stringify([
      { id: "a", ms: 1000, scramble: "R", at: 1, extra: true },
      { id: "b", ms: "1000", scramble: "R", at: 1 },
      { id: "c", ms: -1, scramble: "R", at: 1 },
      null,
      3,
    ]);
    expect(parseSolves(raw)).toEqual([{ id: "a", ms: 1000, scramble: "R", at: 1 }]);
  });

  it("returns nothing for missing or broken data", () => {
    expect(parseSolves(null)).toEqual([]);
    expect(parseSolves("[broken")).toEqual([]);
    expect(parseSolves('{"a":1}')).toEqual([]);
  });
});

describe("best", () => {
  it("is the fastest time", () => {
    expect(best(solves(12000, 9000, 15000))).toBe(9000);
    expect(best([])).toBeUndefined();
  });
});

describe("averageOf", () => {
  it("drops the fastest and slowest of the latest n and averages the rest", () => {
    // Latest 5: 10, 20, 30, 40, 100 -> drop 10 and 100 -> mean of 20, 30, 40.
    expect(averageOf(solves(1, 10, 20, 30, 40, 100), 5)).toBe(30);
  });

  it("is undefined with fewer than n solves", () => {
    expect(averageOf(solves(1, 2, 3, 4), 5)).toBeUndefined();
    expect(averageOf(solves(...Array(11).fill(1)), 12)).toBeUndefined();
    expect(averageOf(solves(...Array(12).fill(1)), 12)).toBe(1);
  });
});

describe("formatTime", () => {
  it("shows seconds with hundredths, cutting the rest", () => {
    expect(formatTime(0)).toBe("0.00");
    expect(formatTime(9876)).toBe("9.87");
    expect(formatTime(12340)).toBe("12.34");
  });

  it("adds minutes from one minute on", () => {
    expect(formatTime(59999)).toBe("59.99");
    expect(formatTime(60000)).toBe("1:00.00");
    expect(formatTime(62345)).toBe("1:02.34");
  });
});
