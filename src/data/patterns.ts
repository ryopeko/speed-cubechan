export type PatternKind = "OLL" | "PLL";

export type Pattern = {
  id: string;
  kind: PatternKind;
  name: string;
  /** Algorithm that solves the case. Its inverse is the setup. */
  alg: string;
};

const OLL_ALGS: readonly string[] = [
  /* 1 */ "R U2 R2 F R F' U2 R' F R F'",
  /* 2 */ "r U r' U2 r U2 R' U2 R U' r'",
  /* 3 */ "r' R2 U R' U r U2 r' U M'",
  /* 4 */ "M U' r U2 r' U' R U' R' M'",
  /* 5 */ "l' U2 L U L' U l",
  /* 6 */ "r U2 R' U' R U' r'",
  /* 7 */ "r U R' U R U2 r'",
  /* 8 */ "l' U' L U' L' U2 l",
  /* 9 */ "R U R' U' R' F R2 U R' U' F'",
  /* 10 */ "R U R' U R' F R F' R U2 R'",
  /* 11 */ "r U R' U R' F R F' R U2 r'",
  /* 12 */ "M' R' U' R U' R' U2 R U' R r'",
  /* 13 */ "F U R U' R2 F' R U R U' R'",
  /* 14 */ "R' F R U R' F' R F U' F'",
  /* 15 */ "l' U' l L' U' L U l' U l",
  /* 16 */ "r U r' R U R' U' r U' r'",
  /* 17 */ "F R' F' R2 r' U R U' R' U' M'",
  /* 18 */ "r U R' U R U2 r2 U' R U' R' U2 r",
  /* 19 */ "r' R U R U R' U' M' R' F R F'",
  /* 20 */ "r U R' U' M2 U R U' R' U' M'",
  /* 21 */ "R U2 R' U' R U R' U' R U' R'",
  /* 22 */ "R U2 R2 U' R2 U' R2 U2 R",
  /* 23 */ "R2 D' R U2 R' D R U2 R",
  /* 24 */ "r U R' U' r' F R F'",
  /* 25 */ "F' r U R' U' r' F R",
  /* 26 */ "R U2 R' U' R U' R'",
  /* 27 */ "R U R' U R U2 R'",
  /* 28 */ "r U R' U' r' R U R U' R'",
  /* 29 */ "R U R' U' R U' R' F' U' F R U R'",
  /* 30 */ "F R' F R2 U' R' U' R U R' F2",
  /* 31 */ "R' U' F U R U' R' F' R",
  /* 32 */ "L U F' U' L' U L F L'",
  /* 33 */ "R U R' U' R' F R F'",
  /* 34 */ "R U R2 U' R' F R U R U' F'",
  /* 35 */ "R U2 R2 F R F' R U2 R'",
  /* 36 */ "L' U' L U' L' U L U L F' L' F",
  /* 37 */ "F R' F' R U R U' R'",
  /* 38 */ "R U R' U R U' R' U' R' F R F'",
  /* 39 */ "L F' L' U' L U F U' L'",
  /* 40 */ "R' F R U R' U' F' U R",
  /* 41 */ "R U R' U R U2 R' F R U R' U' F'",
  /* 42 */ "R' U' R U' R' U2 R F R U R' U' F'",
  /* 43 */ "F' U' L' U L F",
  /* 44 */ "F U R U' R' F'",
  /* 45 */ "F R U R' U' F'",
  /* 46 */ "R' U' R' F R F' U R",
  /* 47 */ "R' U' R' F R F' R' F R F' U R",
  /* 48 */ "F R U R' U' R U R' U' F'",
  /* 49 */ "r U' r2 U r2 U r2 U' r",
  /* 50 */ "r' U r2 U' r2 U' r2 U r'",
  /* 51 */ "F U R U' R' U R U' R' F'",
  /* 52 */ "R U R' U R U' B U' B' R'",
  /* 53 */ "l' U2 L U L' U' L U L' U l",
  /* 54 */ "r U2 R' U' R U R' U' R U' r'",
  /* 55 */ "R' F R U R U' R2 F' R2 U' R' U R U R'",
  /* 56 */ "r' U' r U' R' U R U' R' U R r' U r",
  /* 57 */ "R U R' U' M' U R U' r'",
];

const PLL_ALGS: readonly (readonly [string, string])[] = [
  ["Aa", "x R' U R' D2 R U' R' D2 R2 x'"],
  ["Ab", "x R2 D2 R U R' D2 R U' R x'"],
  ["E", "x' L' U L D' L' U' L D L' U' L D' L' U L D x"],
  ["F", "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R"],
  ["Ga", "R2 U R' U R' U' R U' R2 U' D R' U R D'"],
  ["Gb", "R' U' R U D' R2 U R' U R U' R U' R2 D"],
  ["Gc", "R2 U' R U' R U R' U R2 U D' R U' R' D"],
  ["Gd", "R U R' U' D R2 U' R U' R' U R' U R2 D'"],
  ["H", "M2 U M2 U2 M2 U M2"],
  ["Ja", "x R2 F R F' R U2 r' U r U2 x'"],
  ["Jb", "R U R' F' R U R' U' R' F R2 U' R'"],
  ["Na", "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'"],
  ["Nb", "R' U R U' R' F' U' F R U R' F R' F' R U' R"],
  ["Ra", "R U' R' U' R U R D R' U' R D' R' U2 R'"],
  ["Rb", "R2 F R U R U' R' F' R U2 R' U2 R"],
  ["T", "R U R' U' R' F R2 U' R' U' R U R' F'"],
  ["Ua", "M2 U M U2 M' U M2"],
  ["Ub", "M2 U' M U2 M' U' M2"],
  ["V", "R' U R' U' B' R' B2 U' B' U B' R B R"],
  ["Y", "F R U' R' U' R U R' F' R U R' U' R' F R F'"],
  ["Z", "M' U M2 U M2 U M' U2 M2"],
];

export const OLL_PATTERNS: readonly Pattern[] = OLL_ALGS.map((alg, i) => ({
  id: `oll-${i + 1}`,
  kind: "OLL",
  name: `OLL ${i + 1}`,
  alg,
}));

export const PLL_PATTERNS: readonly Pattern[] = PLL_ALGS.map(([name, alg]) => ({
  id: `pll-${name.toLowerCase()}`,
  kind: "PLL",
  name: `${name} Perm`,
  alg,
}));

export const PATTERNS: readonly Pattern[] = [...OLL_PATTERNS, ...PLL_PATTERNS];

export function findPattern(id: string): Pattern | undefined {
  return PATTERNS.find((p) => p.id === id);
}
