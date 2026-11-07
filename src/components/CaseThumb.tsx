import { useMemo } from "react";
import { applyMoves, invertMoves, parseAlg, SOLVED, STICKERS, type Face, type Vec3 } from "@/lib/cube";
import type { Pattern } from "@/data/patterns";

/*
 * A small drawing of a case: the top face seen from slightly in front and
 * above, with the top row of each side face folded out around it (like the
 * usual OLL/PLL diagrams, tilted). Plain SVG, so a list of 78 stays cheap.
 */

// Match --color-cube-* in globals.css.
const COLORS: Record<Face, string> = {
  U: "#f3ec18",
  D: "#efece4",
  F: "#22cf4b",
  B: "#1e6fe0",
  R: "#ff7612",
  L: "#d6122d",
};
/** OLL only cares which stickers are yellow; the rest are drawn in this gray. */
const OTHER = "#8f8a80";
const BODY = "#2a2723";

/** Camera elevation above the horizon, seen from the front (+z). */
const ELEVATION = (52 * Math.PI) / 180;
/** How far side stickers fold out from vertical. */
const FOLD = (72 * Math.PI) / 180;
/** Camera distance, for a mild perspective. */
const DISTANCE = 7.5;
/** Sticker size within its 1×1 cell, and the side sticker strip length. */
const TILE = 0.8;
const STRIP = 0.7;

const CAM: Vec3 = [0, Math.sin(ELEVATION), Math.cos(ELEVATION)];
const UP: Vec3 = [0, Math.cos(ELEVATION), -Math.sin(ELEVATION)];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const at = (p: Vec3, a: Vec3, s: number, b: Vec3, t: number): Vec3 => [
  p[0] + a[0] * s + b[0] * t,
  p[1] + a[1] * s + b[1] * t,
  p[2] + a[2] * s + b[2] * t,
];

function project(p: Vec3): [number, number] {
  const k = DISTANCE / (DISTANCE - dot(p, CAM));
  return [p[0] * k, -dot(p, UP) * k];
}

type Quad = { index: number; points: Vec3[] };

/** The top-face stickers and the top row of each side face, in 3D. */
const QUADS: readonly Quad[] = STICKERS.filter((s) => s.pos[1] === 1).map((s) => {
  if (s.normal[1] === 1) {
    // Top face: cell centered over the cubie, at the top of the cube.
    const c: Vec3 = [s.pos[0], 1.5, s.pos[2]];
    const h = TILE / 2;
    const X: Vec3 = [1, 0, 0];
    const Z: Vec3 = [0, 0, 1];
    return { index: s.index, points: [at(c, X, -h, Z, -h), at(c, X, h, Z, -h), at(c, X, h, Z, h), at(c, X, -h, Z, h)] };
  }
  // Side face: a strip hanging off the top edge, folded outwards.
  const n = s.normal;
  const tangent: Vec3 = [Math.abs(n[2]), 0, Math.abs(n[0])];
  const offset = dot(s.pos, tangent);
  const edge: Vec3 = [n[0] * 1.5 + tangent[0] * offset, 1.5, n[2] * 1.5 + tangent[2] * offset];
  const out: Vec3 = [n[0] * Math.sin(FOLD), -Math.cos(FOLD), n[2] * Math.sin(FOLD)];
  const h = TILE / 2;
  const g = (1 - TILE) / 2;
  return {
    index: s.index,
    points: [
      at(edge, tangent, -h, out, g),
      at(edge, tangent, h, out, g),
      at(edge, tangent, h, out, g + STRIP),
      at(edge, tangent, -h, out, g + STRIP),
    ],
  };
});

const BODY_QUAD: Vec3[] = [
  [-1.5, 1.5, -1.5],
  [1.5, 1.5, -1.5],
  [1.5, 1.5, 1.5],
  [-1.5, 1.5, 1.5],
];

const toPath = (pts: Vec3[]) =>
  pts.map((p) => project(p).map((v) => v.toFixed(3)).join(",")).join(" ");

const ALL_POINTS = [...QUADS.flatMap((q) => q.points), ...BODY_QUAD].map(project);
const PAD = 0.15;
const minX = Math.min(...ALL_POINTS.map((p) => p[0])) - PAD;
const minY = Math.min(...ALL_POINTS.map((p) => p[1])) - PAD;
const maxX = Math.max(...ALL_POINTS.map((p) => p[0])) + PAD;
const maxY = Math.max(...ALL_POINTS.map((p) => p[1])) + PAD;
const VIEW_BOX = `${minX.toFixed(3)} ${minY.toFixed(3)} ${(maxX - minX).toFixed(3)} ${(maxY - minY).toFixed(3)}`;

const QUAD_PATHS = QUADS.map((q) => ({ index: q.index, d: toPath(q.points) }));
const BODY_PATH = toPath(BODY_QUAD);

export default function CaseThumb({ pattern, className }: { pattern: Pattern; className?: string }) {
  const state = useMemo(
    () => applyMoves(SOLVED, invertMoves(parseAlg(pattern.alg))),
    [pattern.alg],
  );
  const color = (f: Face) => (pattern.kind === "OLL" ? (f === "U" ? COLORS.U : OTHER) : COLORS[f]);

  return (
    <svg viewBox={VIEW_BOX} className={className} aria-hidden>
      <polygon points={BODY_PATH} fill={BODY} stroke={BODY} strokeWidth={0.2} strokeLinejoin="round" />
      {QUAD_PATHS.map((q) => (
        <polygon
          key={q.index}
          points={q.d}
          fill={color(state[q.index])}
          stroke={color(state[q.index])}
          strokeWidth={0.1}
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}
