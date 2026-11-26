// Scramble moves, written in the usual notation, and the state they leave the cube in.

import { applyMoves, formatMoves, parseAlg, SOLVED, type CubeState, type Face, type Move } from "./cube";

const FACES = ["U", "D", "R", "L", "F", "B"] as const;
type ScrambleFace = (typeof FACES)[number];

/** U/D, R/L and F/B turn about the same axis. */
const AXIS: Record<ScrambleFace, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

export const SCRAMBLE_LENGTH = 20;

/**
 * Random face turns. No face is turned twice in a row, and no axis three
 * times in a row (R L R is R2 L), so no move cancels or merges with another.
 * `random` returns a number in [0, 1), like Math.random.
 */
export function randomScramble(length = SCRAMBLE_LENGTH, random: () => number = Math.random): Move[] {
  const moves: Move[] = [];
  const pick = <T>(items: readonly T[]) => items[Math.floor(random() * items.length)];
  while (moves.length < length) {
    const prev = moves.at(-1)?.name as ScrambleFace | undefined;
    const prev2 = moves.at(-2)?.name as ScrambleFace | undefined;
    const faces = FACES.filter((f) => {
      if (f === prev) return false;
      // After two turns on one axis (R L), a third on it would merge with the first.
      if (prev && prev2 && AXIS[prev] === AXIS[prev2] && AXIS[f] === AXIS[prev]) return false;
      return true;
    });
    moves.push({ name: pick(faces), amount: pick([1, 2, 3] as const) });
  }
  return moves;
}

/** A new scramble as text, e.g. "R U2 F' ...". */
export function newScramble(): string {
  return formatMoves(randomScramble());
}

/**
 * Solved, held the way WCA scrambles are applied: white on top, green in front.
 * The rest of the app holds yellow on top, so this is SOLVED turned upside down
 * (z2): U and D, and R and L, swap colors.
 */
const WCA_FLIP: Record<Face, Face> = { U: "D", D: "U", R: "L", L: "R", F: "F", B: "B" };
export const SCRAMBLE_START: CubeState = SOLVED.map((c) => WCA_FLIP[c]);

/** The cube after `scramble` is applied from SCRAMBLE_START. */
export function scrambledState(scramble: string): CubeState {
  return applyMoves(SCRAMBLE_START, parseAlg(scramble));
}
