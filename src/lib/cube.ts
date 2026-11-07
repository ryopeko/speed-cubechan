// Cube state and moves. Pure logic: no rendering dependency.
//
// State is 54 stickers, 9 per face, faces in the order U R F D L B.
// Each face is stored row-major as seen when looking straight at that face
// (U with F at the bottom, D with F at the top, side faces with U at the top).
// A sticker's value is the face letter of its color in the solved state.
//
// Coordinates: x points to R, y points to U, z points to F.
// Cubie positions are in {-1, 0, 1}.

export type Face = "U" | "R" | "F" | "D" | "L" | "B";
export type Vec3 = readonly [number, number, number];
export type CubeState = readonly Face[];

export const FACES: readonly Face[] = ["U", "R", "F", "D", "L", "B"];

type FaceFrame = { normal: Vec3; right: Vec3; down: Vec3 };

const FACE_FRAMES: Record<Face, FaceFrame> = {
  U: { normal: [0, 1, 0], right: [1, 0, 0], down: [0, 0, 1] },
  R: { normal: [1, 0, 0], right: [0, 0, -1], down: [0, -1, 0] },
  F: { normal: [0, 0, 1], right: [1, 0, 0], down: [0, -1, 0] },
  D: { normal: [0, -1, 0], right: [1, 0, 0], down: [0, 0, -1] },
  L: { normal: [-1, 0, 0], right: [0, 0, 1], down: [0, -1, 0] },
  B: { normal: [0, 0, -1], right: [-1, 0, 0], down: [0, -1, 0] },
};

export type Sticker = {
  index: number;
  face: Face;
  /** Position of the cubie this sticker is on. */
  pos: Vec3;
  /** Outward normal of the sticker. */
  normal: Vec3;
};

const add = (a: Vec3, b: Vec3, s = 1): Vec3 => [
  a[0] + b[0] * s,
  a[1] + b[1] * s,
  a[2] + b[2] * s,
];

export const STICKERS: readonly Sticker[] = FACES.flatMap((face, f) => {
  const { normal, right, down } = FACE_FRAMES[face];
  return Array.from({ length: 9 }, (_, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const pos = add(add(normal, right, col - 1), down, row - 1);
    return { index: f * 9 + i, face, pos, normal };
  });
});

const key = (pos: Vec3, normal: Vec3) => `${pos.join(",")}|${normal.join(",")}`;
const INDEX_BY_KEY = new Map(STICKERS.map((s) => [key(s.pos, s.normal), s.index]));

export const SOLVED: CubeState = STICKERS.map((s) => s.face);

export function isSolved(state: CubeState): boolean {
  return state.every((c, i) => c === SOLVED[i]);
}

// ---------------------------------------------------------------------------
// Moves

/** A turn of a layer set. amount is the number of clockwise quarter turns (1, 2, 3 = '). */
export type Move = { name: string; amount: 1 | 2 | 3 };

type LayerDef = {
  /** Rotation axis. A quarter turn of amount 1 is clockwise looking from +axis. */
  axis: Vec3;
  /** Which cubies (by position along the axis) the move turns. */
  layers: readonly number[];
};

// A clockwise turn of a face, seen from outside that face, is a -90° rotation
// about the face's outward normal. Slices and rotations follow the usual
// conventions: M like L, E like D, S like F, x like R, y like U, z like F.
const LAYER_DEFS: Record<string, LayerDef> = {
  U: { axis: [0, 1, 0], layers: [1] },
  D: { axis: [0, -1, 0], layers: [1] },
  R: { axis: [1, 0, 0], layers: [1] },
  L: { axis: [-1, 0, 0], layers: [1] },
  F: { axis: [0, 0, 1], layers: [1] },
  B: { axis: [0, 0, -1], layers: [1] },
  u: { axis: [0, 1, 0], layers: [1, 0] },
  d: { axis: [0, -1, 0], layers: [1, 0] },
  r: { axis: [1, 0, 0], layers: [1, 0] },
  l: { axis: [-1, 0, 0], layers: [1, 0] },
  f: { axis: [0, 0, 1], layers: [1, 0] },
  b: { axis: [0, 0, -1], layers: [1, 0] },
  M: { axis: [-1, 0, 0], layers: [0] },
  E: { axis: [0, -1, 0], layers: [0] },
  S: { axis: [0, 0, 1], layers: [0] },
  x: { axis: [1, 0, 0], layers: [1, 0, -1] },
  y: { axis: [0, 1, 0], layers: [1, 0, -1] },
  z: { axis: [0, 0, 1], layers: [1, 0, -1] },
};

export const MOVE_NAMES = Object.keys(LAYER_DEFS);

const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];

/** Rotate v by -90° about the unit axis a (Rodrigues with cos = 0, sin = -1). */
function rotateCw(v: Vec3, a: Vec3): Vec3 {
  const c = cross(a, v);
  const d = dot(a, v);
  return [-c[0] + d * a[0], -c[1] + d * a[1], -c[2] + d * a[2]];
}

/** The axis and the predicate for which cubies a move turns. Used by the renderer. */
export function moveLayer(name: string): { axis: Vec3; inLayer: (pos: Vec3) => boolean } {
  const def = LAYER_DEFS[name];
  if (!def) throw new Error(`Unknown move: ${name}`);
  return { axis: def.axis, inLayer: (pos) => def.layers.includes(dot(pos, def.axis)) };
}

/**
 * Sticker swap table for one clockwise quarter turn:
 * the sticker at index i moves to index PERM[name][i].
 */
const PERMS: Record<string, readonly number[]> = Object.fromEntries(
  MOVE_NAMES.map((name) => {
    const { axis, inLayer } = moveLayer(name);
    const perm = STICKERS.map((s) => {
      if (!inLayer(s.pos)) return s.index;
      const to = INDEX_BY_KEY.get(key(rotateCw(s.pos, axis), rotateCw(s.normal, axis)));
      if (to === undefined) throw new Error("bad rotation");
      return to;
    });
    return [name, perm];
  }),
);

export function applyMove(state: CubeState, move: Move): CubeState {
  const perm = PERMS[move.name];
  if (!perm) throw new Error(`Unknown move: ${move.name}`);
  let cur = state;
  for (let n = 0; n < move.amount; n++) {
    const next = new Array<Face>(54);
    for (let i = 0; i < 54; i++) next[perm[i]] = cur[i];
    cur = next;
  }
  return cur;
}

export function applyMoves(state: CubeState, moves: readonly Move[]): CubeState {
  return moves.reduce(applyMove, state);
}

// ---------------------------------------------------------------------------
// Notation

const TOKEN = /\s*(?:([()])(\d*)|([URFDLBurfdlbMESxyz])(w?)(\d*)('?))/y;

/**
 * Parse an algorithm string into moves. Accepts ' and 2 (also 2', 3),
 * wide moves as r or Rw, slices M E S, rotations x y z, and parentheses,
 * which are expanded (an optional count after ")" repeats the group).
 */
export function parseAlg(alg: string): Move[] {
  // Normalize typographic primes.
  const src = alg.replace(/[’‘`′]/g, "'").trim();
  const stack: Move[][] = [[]];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < src.length) {
    const start = TOKEN.lastIndex;
    const m = TOKEN.exec(src);
    if (!m) {
      if (/^\s*$/.test(src.slice(start))) break;
      throw new Error(`Cannot parse "${alg}" at position ${start}: "${src.slice(start)}"`);
    }
    const [, paren, repeat, letter, wide, countStr, prime] = m;
    if (paren === "(") {
      if (repeat) throw new Error(`Unexpected count after "(" in "${alg}"`);
      stack.push([]);
    } else if (paren === ")") {
      if (stack.length < 2) throw new Error(`Unbalanced ")" in "${alg}"`);
      const group = stack.pop()!;
      const times = repeat ? Number(repeat) : 1;
      for (let t = 0; t < times; t++) stack[stack.length - 1].push(...group);
    } else {
      let name = letter;
      if (wide) {
        if (!"URFDLB".includes(letter)) throw new Error(`Bad wide move "${letter}w" in "${alg}"`);
        name = letter.toLowerCase();
      }
      const count = countStr ? Number(countStr) : 1;
      const turns = (((prime ? -count : count) % 4) + 4) % 4;
      if (turns !== 0) stack[stack.length - 1].push({ name, amount: turns as 1 | 2 | 3 });
    }
  }
  if (stack.length !== 1) throw new Error(`Unbalanced "(" in "${alg}"`);
  return stack[0];
}

export function invertMove(move: Move): Move {
  return { name: move.name, amount: (4 - move.amount) as 1 | 2 | 3 };
}

/** Reverse the order and invert each move. Inverting an algorithm gives its setup. */
export function invertMoves(moves: readonly Move[]): Move[] {
  return [...moves].reverse().map(invertMove);
}

export function formatMove(move: Move): string {
  return move.name + (move.amount === 1 ? "" : move.amount === 2 ? "2" : "'");
}

export function formatMoves(moves: readonly Move[]): string {
  return moves.map(formatMove).join(" ");
}

/** The setup of an algorithm: the moves that create its case from a solved cube. */
export function setupOf(alg: string): string {
  return formatMoves(invertMoves(parseAlg(alg)));
}
