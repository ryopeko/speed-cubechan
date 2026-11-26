import { describe, expect, it } from "vitest";
import { formatMoves, parseAlg } from "./cube";
import { newScramble, randomScramble, SCRAMBLE_LENGTH } from "./scramble";

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
