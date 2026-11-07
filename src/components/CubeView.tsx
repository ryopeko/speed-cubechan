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
/** Tile outline before the bevel (which adds 0.025 on each side), and its corner radius. */
const TILE_SIZE = 0.82;
const TILE_RADIUS = 0.2;
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

function roundedSquare(size: number, radius: number): THREE.Shape {
  const h = size / 2;
  const r = radius;
  const shape = new THREE.Shape();
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h);
  shape.quadraticCurveTo(h, -h, h, -h + r);
  shape.lineTo(h, h - r);
  shape.quadraticCurveTo(h, h, h - r, h);
  shape.lineTo(-h + r, h);
  shape.quadraticCurveTo(-h, h, -h, h - r);
  shape.lineTo(-h, -h + r);
  shape.quadraticCurveTo(-h, -h, -h + r, -h);
  return shape;
}

function createScene(container: HTMLDivElement): Scene {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(4.2, 4.6, 6.2);
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
  const body = new RoundedBoxGeometry(0.97, 0.97, 0.97, 5, 0.13);
  const bodyMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6 });
  // Each tile is a thin slab with beveled edges. Its back sinks into the body,
  // so the rounded body corners never leave a gap under the tile.
  const stickerGeo = new THREE.ExtrudeGeometry(roundedSquare(TILE_SIZE, TILE_RADIUS), {
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.025,
    bevelSegments: 4,
    curveSegments: 8,
  });
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
    const mesh = new THREE.Mesh(stickerGeo, mat);
    const n = new THREE.Vector3(...s.normal);
    // The slab spans z = -0.02 to 0.04; put its front just above the body face (0.485).
    mesh.position.copy(n.clone().multiplyScalar(0.452));
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
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
      stickerGeo.dispose();
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
