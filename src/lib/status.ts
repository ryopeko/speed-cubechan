import type { Pattern } from "@/data/patterns";
import type { Marks } from "./marks";
import { averageOf, best, type Solves } from "./solves";

/** How many of a set of patterns are at each learning status. */
export type Progress = { total: number; learned: number; practicing: number; none: number };

/** Count the patterns by their status in `marks`. Ids not in `patterns` are ignored. */
export function progressOf(patterns: readonly Pattern[], marks: Marks): Progress {
  let learned = 0;
  let practicing = 0;
  for (const p of patterns) {
    if (marks[p.id] === "learned") learned++;
    else if (marks[p.id] === "practicing") practicing++;
  }
  return { total: patterns.length, learned, practicing, none: patterns.length - learned - practicing };
}

/** The solve records at a glance. Times are in milliseconds; undefined where there is not enough data. */
export type SolveSummary = {
  count: number;
  best?: number;
  ao5?: number;
  ao12?: number;
  /** When the latest solve was finished, as Date.now(). */
  lastAt?: number;
};

export function solveSummary(solves: Solves): SolveSummary {
  return {
    count: solves.length,
    best: best(solves),
    ao5: averageOf(solves, 5),
    ao12: averageOf(solves, 12),
    lastAt: solves.length ? Math.max(...solves.map((s) => s.at)) : undefined,
  };
}
