import { describe, expect, it } from "vitest";
import { applyMoves, formatMoves, invertMoves, parseAlg } from "./cube";
import {
  newScramble,
  randomScramble,
  SCRAMBLE_LENGTH,
  SCRAMBLE_START,
  scrambledState,
} from "./scramble";

const AXIS: Record<string, number> = { U: 0, D: 0, R: 1, L: 1, F: 2, B: 2 };

describe("randomScramble", () => {
  it("has the requested number of face turns", () => {
    expect(randomScramble()).toHaveLength(SCRAMBLE_LENGTH);
    expect(randomScramble(5)).toHaveLength(5);
    for (const m of randomScramble(100)) expect("UDRLFB").toContain(m.name);
  });

  it("never turns a face twice in a row or an axis three times in a row", () => {
    for (let n = 0; n < 200; n++) {
      const moves = randomScramble(30);
      for (let i = 1; i < moves.length; i++) {
        expect(moves[i].name).not.toBe(moves[i - 1].name);
        if (i >= 2) {
          const axes = [moves[i - 2], moves[i - 1], moves[i]].map((m) => AXIS[m.name]);
          expect(axes[0] === axes[1] && axes[1] === axes[2]).toBe(false);
        }
      }
    }
  });

  it("uses the given random source", () => {
    // Always the first allowed face: U; D (U excluded); R (U/D axis used twice); U again.
    expect(formatMoves(randomScramble(4, () => 0))).toBe("U D R U");
  });
});

describe("newScramble", () => {
  it("is written in notation that parses back", () => {
    expect(parseAlg(newScramble())).toHaveLength(SCRAMBLE_LENGTH);
  });
});

describe("scrambledState", () => {
  /** Stickers of one face (U R F D L B), row-major as seen facing it. */
  const face = (state: readonly string[], f: number) => state.slice(f * 9, f * 9 + 9).join("");

  it("starts from white on top and green in front, as WCA scrambles do", () => {
    // Colors are named by the app's solved faces: yellow is U, white is D, orange is R, red is L.
    expect(face(SCRAMBLE_START, 0)).toBe("DDDDDDDDD");
    expect(face(SCRAMBLE_START, 1)).toBe("LLLLLLLLL");
    expect(face(SCRAMBLE_START, 2)).toBe("FFFFFFFFF");
    expect(face(SCRAMBLE_START, 3)).toBe("UUUUUUUUU");
    expect(face(SCRAMBLE_START, 4)).toBe("RRRRRRRRR");
    expect(face(SCRAMBLE_START, 5)).toBe("BBBBBBBBB");
    expect(scrambledState("")).toEqual(SCRAMBLE_START);
  });

  it("applies the scramble from there", () => {
    // R lifts the front's right column (green) to the top, and the bottom's (yellow) to the front.
    const state = scrambledState("R");
    expect(face(state, 0)).toBe("DDFDDFDDF");
    expect(face(state, 2)).toBe("FFUFFUFFU");
  });

  it("is undone by the inverse of the scramble", () => {
    const scramble = newScramble();
    const back = applyMoves(scrambledState(scramble), invertMoves(parseAlg(scramble)));
    expect(back).toEqual(SCRAMBLE_START);
  });
});
