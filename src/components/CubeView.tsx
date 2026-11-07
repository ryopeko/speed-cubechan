"use client";

import { useEffect, useRef } from "react";
import { CUBE_BOX } from "./cubeBox";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
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
/*
 * Each cubie is built like a stickerless piece: every outward face is a thick
 * colored slab whose outline is the piece's shape, and a smaller ivory core
 * sits behind them. Where a slab's corner is rounded, you see down into the
 * core instead of a flat plate behind a label.
 */
/** Outer size of a piece (1 is the spacing, so 1 - PIECE_SIZE is the gap). */
const PIECE_SIZE = 0.99;
/** Thickness of a colored slab, and the size of the core behind the slabs. */
const SLAB_DEPTH = 0.12;
const CORE_SIZE = 0.8;
/** Bevel on a slab's outline and front edge. */
const BEVEL = 0.014;
/** Slab outline before the bevel is added around it. */
const SLAB_OUTLINE = PIECE_SIZE - 2 * BEVEL;
/**
 * How far a slab pulls back from the cube's outer edges. Two slabs of one piece
 * meet there; without this, one slab's side lies in the same plane as the other
 * slab's front and the two colors flicker (z-fighting). Pulled back, each side
 * hides inside the other slab, and the edge looks rounded. Must exceed BEVEL.
 */
const EDGE_INSET = 0.022;

/**
 * Slab corner radii. Only the middle of the face is rounded: the center piece
 * is nearly a circle, and the up/down/left/right edge pieces round the corners
 * that face it. Corner pieces stay sharper, even on the corner facing the center.
 */
const CENTER_RADIUS = 0.42;
const EDGE_INNER_RADIUS = 0.3;
const CORNER_INNER_RADIUS = 0.1;
const OUTER_RADIUS = 0.05;

/**
 * Radius for one corner of a slab.
 * tileOffset: how far the tile is from the face center (0, 1 = edge, √2 = corner).
 * cornerDistance: how far this corner of the tile is from the face center.
 */
function cornerRadius(tileOffset: number, cornerDistance: number): number {
  if (tileOffset < 0.5) return CENTER_RADIUS;
  if (cornerDistance > 1) return OUTER_RADIUS;
  return tileOffset < 1.2 ? EDGE_INNER_RADIUS : CORNER_INNER_RADIUS;
}

/** The ivory core plastic that shows in the gaps and under rounded corners. */
const BODY_COLOR = 0xcfc9bb;

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
/** Slab outline extents in tile-local x and y. */
type Bounds = { x0: number; x1: number; y0: number; y1: number };

function roundedRect({ x0, x1, y0, y1 }: Bounds, r: CornerRadii): THREE.Shape {
  const shape = new THREE.Shape();
  shape.moveTo(x0 + r.nn, y0);
  shape.lineTo(x1 - r.pn, y0);
  shape.absarc(x1 - r.pn, y0 + r.pn, r.pn, -Math.PI / 2, 0, false);
  shape.lineTo(x1, y1 - r.pp);
  shape.absarc(x1 - r.pp, y1 - r.pp, r.pp, 0, Math.PI / 2, false);
  shape.lineTo(x0 + r.np, y1);
  shape.absarc(x0 + r.np, y1 - r.np, r.np, Math.PI / 2, Math.PI, false);
  shape.lineTo(x0, y0 + r.nn);
  shape.absarc(x0 + r.nn, y0 + r.nn, r.nn, Math.PI, (Math.PI * 3) / 2, false);
  return shape;
}

function createScene(container: HTMLDivElement): Scene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping; // keeps the vivid plastic colors saturated
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
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

  // Lighting, modeled on a cube on a desk under room light:
  // - a soft room environment, for glossy reflections like real plastic;
  // - a key light that casts shadows, so the gaps and the hollows under the
  //   rounded corners go dark. It rides with the camera (up and to the right
  //   of the viewer), so the faces you look at are always lit the same way.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  scene.environment = envMap;
  scene.environmentIntensity = 0.55;
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6f6a60, 0.5));

  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(3, 5, 1); // relative to the camera
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -2.4;
  key.shadow.camera.right = 2.4;
  key.shadow.camera.top = 2.4;
  key.shadow.camera.bottom = -2.4;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 30;
  key.shadow.radius = 4;
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.015;
  camera.add(key);
  scene.add(camera);
  scene.add(key.target); // aims at the origin

  // 27 cubies: an ivory core with a glossy colored slab for each sticker.
  const body = new RoundedBoxGeometry(CORE_SIZE, CORE_SIZE, CORE_SIZE, 3, 0.04);
  const bodyMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6 });
  // Slabs differ only by their outline, so geometries are shared by that.
  const tileGeos = new Map<string, THREE.ExtrudeGeometry>();
  const tileGeo = (b: Bounds, r: CornerRadii) => {
    const k = `${b.x0},${b.x1},${b.y0},${b.y1}|${r.pp},${r.np},${r.nn},${r.pn}`;
    let geo = tileGeos.get(k);
    if (!geo) {
      geo = new THREE.ExtrudeGeometry(roundedRect(b, r), {
        depth: SLAB_DEPTH - 2 * BEVEL,
        bevelEnabled: true,
        bevelThickness: BEVEL,
        bevelSize: BEVEL,
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
        const core = new THREE.Mesh(body, bodyMat);
        core.castShadow = true;
        core.receiveShadow = true;
        g.add(core);
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
      return cornerRadius(offset.length(), corner.length());
    };
    // Pull back the sides that lie on the cube's outer edges.
    const h = SLAB_OUTLINE / 2;
    const isOuter = (axis: THREE.Vector3, sign: number) => offset.dot(axis) * sign > 0.5;
    const bounds: Bounds = {
      x0: -h + (isOuter(ex, -1) ? EDGE_INSET : 0),
      x1: h - (isOuter(ex, 1) ? EDGE_INSET : 0),
      y0: -h + (isOuter(ey, -1) ? EDGE_INSET : 0),
      y1: h - (isOuter(ey, 1) ? EDGE_INSET : 0),
    };
    const geo = tileGeo(bounds, {
      pp: radius(1, 1),
      np: radius(-1, 1),
      nn: radius(-1, -1),
      pn: radius(1, -1),
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    // The slab spans z = -BEVEL to SLAB_DEPTH - BEVEL; put its front on the piece's face.
    mesh.position.copy(n.clone().multiplyScalar(PIECE_SIZE / 2 - (SLAB_DEPTH - BEVEL)));
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
      envMap.dispose();
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
