import { describe, expect, it } from "vitest";
import {
  applyMove,
  applyMoves,
  CubeState,
  formatMoves,
  invertMoves,
  isSolved,
  MOVE_NAMES,
  parseAlg,
  setupOf,
  SOLVED,
  STICKERS,
} from "./cube";
import { OLL_PATTERNS, PATTERNS, PLL_PATTERNS } from "@/data/patterns";

const run = (alg: string, state: CubeState = SOLVED) => applyMoves(state, parseAlg(alg));
const face = (state: CubeState, f: string) => state.slice("URFDLB".indexOf(f) * 9).slice(0, 9).join("");

describe("moves", () => {
  it.each(MOVE_NAMES)("%s four times returns to solved", (name) => {
    let s = SOLVED;
    for (let i = 0; i < 4; i++) {
      s = applyMove(s, { name, amount: 1 });
      if (i < 3) expect(isSolved(s)).toBe(false);
    }
    expect(isSolved(s)).toBe(true);
  });

  it.each(MOVE_NAMES)("%s2 twice returns to solved", (name) => {
    const s = applyMove(SOLVED, { name, amount: 2 });
    expect(isSolved(s)).toBe(false);
    expect(isSolved(applyMove(s, { name, amount: 2 }))).toBe(true);
  });

  it("turns in the standard directions", () => {
    // U: the front top row goes to the left, so F's top row now shows R.
    expect(face(run("U"), "F")).toBe("RRRFFFFFF");
    // R: the front right column goes up.
    expect(face(run("R"), "U")).toBe("UUFUUFUUF");
    // F: the top front row goes to the right.
    expect(face(run("F"), "R")).toBe("URRURRURR");
    // D: the front bottom row goes to the right.
    expect(face(run("D"), "F")).toBe("FFFFFFLLL");
    // L: the front left column goes down.
    expect(face(run("L"), "D")).toBe("FDDFDDFDD");
    // B: the top row goes to the left (seen from the front).
    expect(face(run("B"), "L")).toBe("ULLULLULL");
    // M follows L, x follows R, y follows U.
    expect(face(run("M"), "U")).toBe("UBUUBUUBU");
    expect(face(run("x"), "U")).toBe("FFFFFFFFF");
    expect(face(run("y"), "F")).toBe("RRRRRRRRR");
  });

  it("wide moves are a face turn plus a slice", () => {
    expect(run("r")).toEqual(run("R M'"));
    expect(run("Rw")).toEqual(run("r"));
    expect(run("l")).toEqual(run("L M"));
    expect(run("f")).toEqual(run("F S"));
    expect(run("x")).toEqual(run("R M' L'"));
  });

  it("the sexy move has order 6", () => {
    expect(isSolved(run("(R U R' U')6"))).toBe(true);
    expect(isSolved(run("(R U R' U')3"))).toBe(false);
  });

  it("has 54 stickers, 9 per face", () => {
    expect(STICKERS).toHaveLength(54);
    expect(SOLVED.filter((c) => c === "U")).toHaveLength(9);
  });
});

describe("notation", () => {
  it("reads ', 2 and plain moves", () => {
    expect(parseAlg("R U' F2")).toEqual([
      { name: "R", amount: 1 },
      { name: "U", amount: 3 },
      { name: "F", amount: 2 },
    ]);
  });

  it("treats 2' as 2 and accepts typographic primes", () => {
    expect(parseAlg("R2' U’")).toEqual([
      { name: "R", amount: 2 },
      { name: "U", amount: 3 },
    ]);
  });

  it("expands parentheses, including nested and repeated groups", () => {
    expect(formatMoves(parseAlg("(R U R' U') F"))).toBe("R U R' U' F");
    expect(formatMoves(parseAlg("(R U)2"))).toBe("R U R U");
    expect(formatMoves(parseAlg("F (R (U)2)2"))).toBe("F R U U R U U");
  });

  it("reads wide moves, slices and rotations", () => {
    expect(formatMoves(parseAlg("r Rw M E S x y' z2"))).toBe("r r M E S x y' z2");
  });

  it("rejects bad input", () => {
    expect(() => parseAlg("R Q")).toThrow();
    expect(() => parseAlg("(R U")).toThrow();
    expect(() => parseAlg("R U)")).toThrow();
  });

  it("inverts an algorithm", () => {
    expect(formatMoves(invertMoves(parseAlg("R U2 F'")))).toBe("F U2 R'");
    expect(setupOf("R U R' U'")).toBe("U R U' R'");
  });
});

// ---------------------------------------------------------------------------
// Pattern data

/** Indices of stickers in the top layer (U face plus the top row of each side). */
const TOP = STICKERS.filter((s) => s.pos[1] === 1).map((s) => s.index);
const SIDE_TOP = STICKERS.filter((s) => s.pos[1] === 1 && s.normal[1] === 0).map((s) => s.index);
const NOT_TOP = STICKERS.filter((s) => s.pos[1] !== 1).map((s) => s.index);
const U_FACE = STICKERS.filter((s) => s.normal[1] === 1).map((s) => s.index);

const f2lSolved = (s: CubeState) => NOT_TOP.every((i) => s[i] === SOLVED[i]);
const centersSolved = (s: CubeState) => [4, 13, 22, 31, 40, 49].every((i) => s[i] === SOLVED[i]);
const U_TURNS = ["", "U", "U2", "U'"];

/** OLL case signature: which top-layer stickers are yellow, minimized over AUF. */
function ollSignature(s: CubeState): string {
  return U_TURNS.map((u) => TOP.map((i) => (run(u, s)[i] === "U" ? "1" : "0")).join("")).sort()[0];
}

/** PLL case signature: top-layer side colors, minimized over pre- and post-AUF. */
function pllSignature(setup: string): string {
  const sigs = U_TURNS.flatMap((a) =>
    U_TURNS.map((b) => {
      const s = run(`${a} ${setup} ${b}`);
      return SIDE_TOP.map((i) => s[i]).join("");
    }),
  );
  return sigs.sort()[0];
}

describe("patterns", () => {
  it("has 57 OLL and 21 PLL cases with unique ids", () => {
    expect(OLL_PATTERNS).toHaveLength(57);
    expect(PLL_PATTERNS).toHaveLength(21);
    expect(new Set(PATTERNS.map((p) => p.id)).size).toBe(PATTERNS.length);
  });

  it.each(PATTERNS.map((p) => [p.name, p.alg]))("%s parses", (_, alg) => {
    expect(parseAlg(alg).length).toBeGreaterThan(0);
  });

  it.each(PATTERNS.map((p) => [p.name, p.alg]))(
    "%s: alg then its setup returns to solved",
    (_, alg) => {
      const moves = parseAlg(alg);
      expect(isSolved(applyMoves(applyMoves(SOLVED, moves), invertMoves(moves)))).toBe(true);
    },
  );

  it.each(OLL_PATTERNS.map((p) => [p.name, p.alg]))(
    "%s: setup keeps F2L and makes an unsolved OLL",
    (_, alg) => {
      const s = run(setupOf(alg));
      expect(centersSolved(s)).toBe(true);
      expect(f2lSolved(s)).toBe(true);
      expect(U_FACE.every((i) => s[i] === "U")).toBe(false);
    },
  );

  it.each(PLL_PATTERNS.map((p) => [p.name, p.alg]))(
    "%s: setup keeps F2L and OLL, and needs more than AUF",
    (_, alg) => {
      const s = run(setupOf(alg));
      expect(centersSolved(s)).toBe(true);
      expect(f2lSolved(s)).toBe(true);
      expect(U_FACE.every((i) => s[i] === "U")).toBe(true);
      expect(U_TURNS.some((u) => isSolved(run(u, s)))).toBe(false);
    },
  );

  it("every OLL case is different (so all 57 are covered)", () => {
    const sigs = OLL_PATTERNS.map((p) => ollSignature(run(setupOf(p.alg))));
    const dupes = OLL_PATTERNS.filter((_, i) => sigs.indexOf(sigs[i]) !== i).map((p) => p.name);
    expect(dupes).toEqual([]);
  });

  it("every PLL case is different (so all 21 are covered)", () => {
    const sigs = PLL_PATTERNS.map((p) => pllSignature(setupOf(p.alg)));
    const dupes = PLL_PATTERNS.filter((_, i) => sigs.indexOf(sigs[i]) !== i).map((p) => p.name);
    expect(dupes).toEqual([]);
  });
});
