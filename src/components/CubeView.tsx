"use client";

import { useEffect, useRef } from "react";
import { CUBE_BOX } from "./cubeBox";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import {
  applyMoves,
  CubeState,
  Face,
  Move,
  moveLayer,
  STICKERS,
  Vec3,
} from "@/lib/cube";

export type CubeViewProps = {
  /** State before any of `moves` is applied. */
  start: CubeState;
  moves: readonly Move[];
  /** How many of `moves` are applied. Going up by one animates that move. */
  position: number;
  /** Time for a quarter turn, in ms. A half turn (U2) takes twice as long. */
  quarterTurnMs?: number;
};

// Stickerless cube colors (match --color-cube-* in globals.css).
const COLORS: Record<Face, number> = {
  U: 0xf3ec18, // yellow
  D: 0xefece4, // ivory white
  F: 0x22cf4b, // green
  B: 0x1e6fe0, // blue
  R: 0xff7612, // orange
  L: 0xd6122d, // red
};
/** Cubie size (1 is the spacing, so 1 - CUBIE_SIZE is the gap) and its edge radius. */
const CUBIE_SIZE = 0.99;
const CUBIE_RADIUS = 0.06;
/** Tile outline before the bevel (which adds 0.015 on each side). */
const TILE_SIZE = 0.86;
/**
 * Tile corner radii. Like a stickerless cube, corners get rounder toward the
 * middle of the face: the center tile is nearly a circle, and the corners of
 * the other tiles that touch it are rounded much more than the outer ones.
 */
const CENTER_TILE_RADIUS = 0.4;
const INNER_CORNER_RADIUS = 0.26;
const MIDDLE_CORNER_RADIUS = 0.1;
const OUTER_CORNER_RADIUS = 0.06;

/** Radius for a tile corner, by its distance from the face center (in cubie units). */
function cornerRadius(distance: number, isCenterTile: boolean): number {
  if (isCenterTile) return CENTER_TILE_RADIUS;
  if (distance < 1) return INNER_CORNER_RADIUS; // ≈ 0.71: touches the center tile
  if (distance < 2) return MIDDLE_CORNER_RADIUS; // ≈ 1.58
  return OUTER_CORNER_RADIUS; // ≈ 2.12: the cube's corner
}
/** The ivory plastic that shows in the gaps between tiles. */
const BODY_COLOR = 0xd9d4c8;

/** Default time for a quarter turn. */
export const QUARTER_TURN_MS = 300;
const posKey = (p: Vec3) => p.join(",");

type Scene = {
  setState: (state: CubeState) => void;
  animate: (move: Move, quarterTurnMs: number, onDone: () => void) => void;
  cancelAnimation: () => void;
  dispose: () => void;
};

/** Corner radii keyed by the corner's signs in tile-local x and y. */
type CornerRadii = { pp: number; np: number; nn: number; pn: number };

function roundedRect(size: number, r: CornerRadii): THREE.Shape {
  const h = size / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-h + r.nn, -h);
  shape.lineTo(h - r.pn, -h);
  shape.absarc(h - r.pn, -h + r.pn, r.pn, -Math.PI / 2, 0, false);
  shape.lineTo(h, h - r.pp);
  shape.absarc(h - r.pp, h - r.pp, r.pp, 0, Math.PI / 2, false);
  shape.lineTo(-h + r.np, h);
  shape.absarc(-h + r.np, h - r.np, r.np, Math.PI / 2, Math.PI, false);
  shape.lineTo(-h, -h + r.nn);
  shape.absarc(-h + r.nn, -h + r.nn, r.nn, Math.PI, (Math.PI * 3) / 2, false);
  return shape;
}

function createScene(container: HTMLDivElement): Scene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
  // A narrow angle from further away keeps the perspective mild.
  camera.position.set(6.1, 6.7, 9.0);
  camera.lookAt(0, 0, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.enableDamping = true;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 2.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(3, 6, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(-4, -2, -3);
  scene.add(fill);

  // 27 cubies: an ivory body with a rounded, glossy tile for each sticker on it.
  const body = new RoundedBoxGeometry(CUBIE_SIZE, CUBIE_SIZE, CUBIE_SIZE, 4, CUBIE_RADIUS);
  const bodyMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6 });
  // Each tile is a thin slab with beveled edges. Its back sinks into the body,
  // so the rounded body corners never leave a gap under the tile.
  // Tiles differ only by their corner radii, so geometries are shared by those.
  const tileGeos = new Map<string, THREE.ExtrudeGeometry>();
  const tileGeo = (r: CornerRadii) => {
    const k = `${r.pp},${r.np},${r.nn},${r.pn}`;
    let geo = tileGeos.get(k);
    if (!geo) {
      geo = new THREE.ExtrudeGeometry(roundedRect(TILE_SIZE, r), {
        depth: 0.012,
        bevelEnabled: true,
        bevelThickness: 0.012,
        bevelSize: 0.015,
        bevelSegments: 4,
        curveSegments: 12,
      });
      tileGeos.set(k, geo);
    }
    return geo;
  };
  const cubies = new Map<string, THREE.Group>();
  for (let x = -1; x <= 1; x++)
    for (let y = -1; y <= 1; y++)
      for (let z = -1; z <= 1; z++) {
        const g = new THREE.Group();
        g.position.set(x, y, z);
        g.add(new THREE.Mesh(body, bodyMat));
        scene.add(g);
        cubies.set(posKey([x, y, z]), g);
      }

  const stickerMats = STICKERS.map((s) => {
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS[s.face],
      roughness: 0.32,
    });
    const n = new THREE.Vector3(...s.normal);
    const rotation = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
    // Where the tile sits on its face, relative to the face center.
    const pos = new THREE.Vector3(...s.pos);
    const offset = pos.clone().sub(n.clone().multiplyScalar(pos.dot(n)));
    const ex = new THREE.Vector3(1, 0, 0).applyQuaternion(rotation);
    const ey = new THREE.Vector3(0, 1, 0).applyQuaternion(rotation);
    const radius = (sx: number, sy: number) => {
      const corner = offset
        .clone()
        .addScaledVector(ex, sx * 0.5)
        .addScaledVector(ey, sy * 0.5);
      return cornerRadius(corner.length(), offset.lengthSq() === 0);
    };
    const geo = tileGeo({
      pp: radius(1, 1),
      np: radius(-1, 1),
      nn: radius(-1, -1),
      pn: radius(1, -1),
    });

    const mesh = new THREE.Mesh(geo, mat);
    // The slab spans z = -0.012 to 0.024; put its front just above the body face.
    mesh.position.copy(n.clone().multiplyScalar(CUBIE_SIZE / 2 + 0.004 - 0.024));
    mesh.quaternion.copy(rotation);
    cubies.get(posKey(s.pos))!.add(mesh);
    return mat;
  });

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // A pivot that holds the turning layer during an animation.
  const pivot = new THREE.Group();
  scene.add(pivot);
  let anim: {
    axis: THREE.Vector3;
    angle: number;
    t0: number;
    duration: number;
    onDone: () => void;
  } | null = null;

  const releasePivot = () => {
    pivot.rotation.set(0, 0, 0);
    pivot.updateMatrixWorld();
    for (const [k, g] of cubies) {
      if (g.parent === pivot) {
        scene.add(g);
        g.rotation.set(0, 0, 0);
        g.position.set(...(k.split(",").map(Number) as [number, number, number]));
      }
    }
    pivot.quaternion.identity();
  };

  let frame = 0;
  const loop = (now: number) => {
    frame = requestAnimationFrame(loop);
    if (anim) {
      const t = Math.min(1, (now - anim.t0) / anim.duration);
      // Ease in and out, so the start of the turn is easy to follow.
      const eased = t < 0.5 ? 2 * t * t : 1 - (2 - 2 * t) ** 2 / 2;
      pivot.quaternion.setFromAxisAngle(anim.axis, anim.angle * eased);
      if (t >= 1) {
        const { onDone } = anim;
        anim = null;
        releasePivot();
        onDone();
      }
    }
    controls.update();
    renderer.render(scene, camera);
  };
  frame = requestAnimationFrame(loop);

  return {
    setState(state) {
      state.forEach((c, i) => stickerMats[i].color.setHex(COLORS[c]));
    },
    animate(move, quarterTurnMs, onDone) {
      const { axis, inLayer } = moveLayer(move.name);
      for (const [k, g] of cubies) {
        if (inLayer(k.split(",").map(Number) as unknown as Vec3)) pivot.attach(g);
      }
      const quarter = move.amount === 3 ? 1 : -move.amount; // clockwise = negative angle
      anim = {
        axis: new THREE.Vector3(...axis),
        angle: (quarter * Math.PI) / 2,
        t0: performance.now(),
        duration: quarterTurnMs * Math.abs(quarter),
        onDone,
      };
    },
    cancelAnimation() {
      anim = null;
      releasePivot();
    },
    dispose() {
      cancelAnimationFrame(frame);
      ro.disconnect();
      controls.dispose();
      body.dispose();
      bodyMat.dispose();
      tileGeos.forEach((g) => g.dispose());
      stickerMats.forEach((m) => m.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}

export default function CubeView({
  start,
  moves,
  position,
  quarterTurnMs = QUARTER_TURN_MS,
}: CubeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
  // Read through a ref, so changing the speed doesn't restart the running turn.
  const quarterTurnMsRef = useRef(quarterTurnMs);
  useEffect(() => {
    quarterTurnMsRef.current = quarterTurnMs;
  }, [quarterTurnMs]);
  // What the scene currently shows (or will show once the running turn ends).
  const shownRef = useRef<{ start: CubeState; moves: readonly Move[]; position: number } | null>(
    null,
  );

  useEffect(() => {
    const scene = createScene(containerRef.current!);
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
      shownRef.current = null;
    };
  }, []);

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;
    const prev = shownRef.current;
    shownRef.current = { start, moves, position };
    scene.cancelAnimation();

    const stepForward =
      prev && prev.start === start && prev.moves === moves && position === prev.position + 1;
    if (stepForward) {
      const before = applyMoves(start, moves.slice(0, prev.position));
      scene.setState(before);
      scene.animate(moves[prev.position], quarterTurnMsRef.current, () =>
        scene.setState(applyMoves(start, moves.slice(0, position))),
      );
    } else {
      scene.setState(applyMoves(start, moves.slice(0, position)));
    }
  }, [start, moves, position]);

  return <div ref={containerRef} className={CUBE_BOX} />;
}
