"use client";

import { useEffect, useRef } from "react";
import { CUBE_BOX } from "./cubeBox";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
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
/** The ivory plastic that shows in the gaps between tiles. */
const BODY_COLOR = 0xd9d4c8;

const TURN_MS = 220;
const posKey = (p: Vec3) => p.join(",");

type Scene = {
  setState: (state: CubeState) => void;
  animate: (move: Move, onDone: () => void) => void;
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
  const body = new THREE.BoxGeometry(0.97, 0.97, 0.97);
  const bodyMat = new THREE.MeshStandardMaterial({ color: BODY_COLOR, roughness: 0.6 });
  const stickerGeo = new THREE.ShapeGeometry(roundedSquare(0.9, 0.14), 6);
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
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(stickerGeo, mat);
    const n = new THREE.Vector3(...s.normal);
    // Sit just above the body's face (0.485), facing outward.
    mesh.position.copy(n.clone().multiplyScalar(0.488));
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
  let anim: { axis: THREE.Vector3; angle: number; t0: number; onDone: () => void } | null = null;

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
      const t = Math.min(1, (now - anim.t0) / TURN_MS);
      const eased = t * (2 - t);
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
    animate(move, onDone) {
      const { axis, inLayer } = moveLayer(move.name);
      for (const [k, g] of cubies) {
        if (inLayer(k.split(",").map(Number) as unknown as Vec3)) pivot.attach(g);
      }
      const quarter = move.amount === 3 ? 1 : -move.amount; // clockwise = negative angle
      anim = {
        axis: new THREE.Vector3(...axis),
        angle: (quarter * Math.PI) / 2,
        t0: performance.now(),
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

export default function CubeView({ start, moves, position }: CubeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<Scene | null>(null);
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
      scene.animate(moves[prev.position], () =>
        scene.setState(applyMoves(start, moves.slice(0, position))),
      );
    } else {
      scene.setState(applyMoves(start, moves.slice(0, position)));
    }
  }, [start, moves, position]);

  return <div ref={containerRef} className={CUBE_BOX} />;
}
