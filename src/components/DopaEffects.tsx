"use client";

import { useEffect, useRef, useState } from "react";
import { onDopaEvent, useDopa, type DopaEvent } from "@/lib/dopa";

/*
 * ドパモード's show: a disco background behind the page, and on each event a
 * confetti burst, a flash, and big pop-up text over the cube.
 * Everything is CSS and one canvas; nothing renders while the mode is off.
 */

const COLORS = ["#ff2bd6", "#22e4ff", "#ffe600", "#39ff88", "#ff7a1a", "#a64dff", "#ffffff"];
const CHEERS = ["NICE!", "GREAT!", "COOL!", "YEAH!", "FEVER!", "DOPA!", "SUGOI!"];

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
};

type Popup = { id: number; text: string; sub?: string; big: boolean; x: number; y: number };

// Pop-up ids; module-level so a re-run effect (dev Strict Mode) never reuses one.
let nextPopupId = 0;

const pick = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

/** Center of the 3D cube view, or of the screen when there is none. */
function cubeCenter(): { x: number; y: number } {
  const box = document.querySelector("[data-cube-box]")?.getBoundingClientRect();
  return box
    ? { x: box.left + box.width / 2, y: box.top + box.height / 2 }
    : { x: innerWidth / 2, y: innerHeight / 2 };
}

export default function DopaEffects() {
  const dopa = useDopa();
  if (!dopa) return null;
  return <Show />;
}

function Show() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const frame = useRef(0);
  const started = useRef(false);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [flash, setFlash] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 2);
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);

    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      particles.current = particles.current.filter((p) => p.life > 0 && p.y < innerHeight + 40);
      for (const p of particles.current) {
        p.vy += 0.25;
        p.vx *= 0.985;
        p.vy *= 0.985;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.life -= 1;
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / 30);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      frame.current = particles.current.length ? requestAnimationFrame(tick) : 0;
    };

    const burst = (x: number, y: number, count: number, speed: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const v = speed * (0.4 + Math.random() * 0.8);
        particles.current.push({
          x,
          y,
          vx: Math.cos(angle) * v,
          vy: Math.sin(angle) * v - speed * 0.5,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.4,
          w: 5 + Math.random() * 6,
          h: 3 + Math.random() * 4,
          color: pick(COLORS),
          life: 70 + Math.random() * 50,
        });
      }
    };

    const rain = (count: number) => {
      for (let i = 0; i < count; i++) {
        particles.current.push({
          x: Math.random() * innerWidth,
          y: -20 - Math.random() * innerHeight * 0.5,
          vx: (Math.random() - 0.5) * 3,
          vy: 2 + Math.random() * 4,
          rot: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          w: 6 + Math.random() * 7,
          h: 3 + Math.random() * 5,
          color: pick(COLORS),
          life: 220,
        });
      }
    };

    const popup = (p: Omit<Popup, "id">, ms: number) => {
      const id = nextPopupId++;
      setPopups((list) => [...list, { ...p, id }]);
      setTimeout(() => setPopups((list) => list.filter((q) => q.id !== id)), ms);
    };

    const play = (e: DopaEvent) => {
      const c = cubeCenter();
      if (e.kind === "move") {
        popup({ text: e.label, sub: pick(CHEERS), big: false, ...c }, 900);
        if (!reduced) burst(c.x, c.y, 70, 11);
      } else if (e.kind === "done") {
        popup({ text: "DOPA!!", sub: "COMPLETE!", big: true, ...c }, 1800);
        if (!reduced) {
          burst(c.x, c.y, 160, 16);
          rain(160);
        }
      } else {
        popup({ text: "ドパモード", sub: "ON!", big: true, x: innerWidth / 2, y: innerHeight / 2 }, 1500);
        if (!reduced) rain(120);
      }
      if (!reduced) setFlash((f) => f + 1);
      if (!frame.current && particles.current.length) frame.current = requestAnimationFrame(tick);
    };

    const off = onDopaEvent(play);
    // This mounts when the mode turns on: open with the start effect, once
    // (dev Strict Mode runs effects twice).
    if (!started.current) {
      started.current = true;
      play({ kind: "start" });
    }
    return () => {
      off();
      removeEventListener("resize", resize);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  return (
    <>
      {/* Disco floor: rotating mirror-ball beams, sweeping spotlights, twinkles. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#0b0418]">
        <div className="dopa-beams absolute top-1/2 left-1/2 size-[220vmax] -translate-1/2" />
        <div className="dopa-spot dopa-spot-a" />
        <div className="dopa-spot dopa-spot-b" />
        <div className="dopa-spot dopa-spot-c" />
        <div className="dopa-twinkle absolute inset-0" />
      </div>

      {flash > 0 && (
        <div
          key={flash}
          aria-hidden
          className="pointer-events-none fixed inset-0 z-40 animate-dopa-flash bg-[radial-gradient(circle,rgba(255,255,255,0.55),rgba(255,43,214,0.25)_45%,transparent_75%)]"
        />
      )}

      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-40 size-full" />

      <div aria-live="polite" className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {popups.map((p) => (
          <div
            key={p.id}
            className="absolute flex -translate-1/2 flex-col items-center whitespace-nowrap"
            style={{ left: p.x, top: p.y }}
          >
            <div className={p.big ? "animate-dopa-pop-big" : "animate-dopa-pop"}>
              <span className={`dopa-neon block font-black italic ${p.big ? "text-6xl sm:text-8xl" : "font-mono text-6xl sm:text-7xl"}`}>
                {p.text}
              </span>
              {p.sub && (
                <span className="dopa-neon-sub block text-center text-2xl font-black italic sm:text-3xl">{p.sub}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
