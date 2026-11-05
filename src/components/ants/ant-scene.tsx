"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { TOP_ANT } from "./sprites";

type Props = {
  className?: string;
  /** Draw the rotating 3D pixel flower. */
  flower?: boolean;
  /** Flower centre as a fraction of the canvas (0–1). */
  flowerX?: number;
  flowerY?: number;
  /** Flower radius as a fraction of the smaller canvas side. */
  flowerSize?: number;
  /** Maximum ant columns on screen at once (scaled down on small screens). */
  trails?: number;
  /** Seconds between new columns setting off (randomised ±50%). */
  every?: number;
};

/* ------------------------------------------------------------------ Flower */

type FlowerDot = {
  kind: "petal" | "centre" | "stem";
  // petal params
  theta: number;
  u: number;
  v: number;
  r: number; // petal length
  w: number; // petal half-width
  tilt: number;
  curl: number;
  z0: number;
  // fixed position for centre/stem dots
  x: number;
  y: number;
  z: number;
};

/** `k` = samples per unit length; chosen so every grid cell a petal covers gets lit. */
function buildFlower(k: number): FlowerDot[] {
  const dots: FlowerDot[] = [];
  const base = { theta: 0, u: 0, v: 0, r: 0, w: 0, tilt: 0, curl: 0, z0: 0, x: 0, y: 0, z: 0 };
  const petals = (n: number, offset: number, r: number, w: number, tilt: number, curl: number, z0 = 0) => {
    const uSteps = Math.ceil(r * k * 1.3);
    const vSteps = Math.max(3, Math.ceil(2 * w * k));
    for (let p = 0; p < n; p++) {
      const theta = offset + (p / n) * Math.PI * 2;
      for (let i = 1; i <= uSteps; i++) {
        const u = i / uSteps;
        for (let j = 0; j < vSteps; j++) {
          const v = vSteps === 1 ? 0 : (j / (vSteps - 1)) * 2 - 1;
          dots.push({ ...base, kind: "petal", theta, u, v, r, w, tilt, curl, z0 });
        }
      }
    }
  };
  petals(8, 0, 1, 0.3, 0.28, 0.95); // outer, open
  petals(6, Math.PI / 6, 0.72, 0.24, 0.75, 0.7); // inner, more upright
  petals(5, Math.PI / 5, 0.42, 0.16, 1.15, 0.5, 0.02); // bud
  // Centre: a small filled dome.
  const step = 1 / k;
  for (let x = -0.15; x <= 0.15; x += step)
    for (let y = -0.15; y <= 0.15; y += step) {
      const rr = Math.hypot(x, y);
      if (rr <= 0.15) dots.push({ ...base, kind: "centre", x, y, z: 0.16 - rr * 0.6 });
    }
  // Stem with two leaves.
  for (let z = 0; z >= -1.7; z -= step * 0.7) dots.push({ ...base, kind: "stem", x: 0.06 * Math.sin(z * 2.2), y: 0, z });
  petals(1, 0.4, 0.55, 0.13, 0.25, 0.6, -0.95);
  petals(1, 0.4 + Math.PI, 0.45, 0.11, 0.35, 0.6, -1.25);
  return dots;
}

/* -------------------------------------------------------------------- Ants */

type Trail = { pts: { x: number; y: number }[]; cum: number[]; total: number };
type Column = { trail: Trail; speed: number; start: number; offsets: number[]; wobble: number };

function makeTrail(w: number, h: number): Trail {
  const m = 60;
  const edge = (side: number) => {
    const r = Math.random();
    if (side === 0) return { x: -m, y: h * (0.15 + r * 0.75) };
    if (side === 1) return { x: w + m, y: h * (0.15 + r * 0.75) };
    if (side === 2) return { x: w * (0.1 + r * 0.8), y: -m };
    return { x: w * (0.1 + r * 0.8), y: h + m };
  };
  // Mostly side-to-side trails; occasionally from the top or bottom.
  const from = Math.random() < 0.75 ? Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 2);
  const to = from < 2 ? 1 - from : from === 2 ? 3 : 2;
  const p0 = edge(from);
  const p3 = edge(Math.random() < 0.8 ? to : 1 - (from % 2));
  const p1 = { x: w * (0.15 + Math.random() * 0.7), y: h * (0.1 + Math.random() * 0.8) };
  const p2 = { x: w * (0.15 + Math.random() * 0.7), y: h * (0.1 + Math.random() * 0.8) };
  const pts: { x: number; y: number }[] = [];
  const N = 160;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
    pts.push({ x: a * p0.x + b * p1.x + c * p2.x + d * p3.x, y: a * p0.y + b * p1.y + c * p2.y + d * p3.y });
  }
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y));
  return { pts, cum, total: cum[cum.length - 1] };
}

function pointAt(tr: Trail, s: number) {
  let lo = 0, hi = tr.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (tr.cum[mid] < s) lo = mid; else hi = mid;
  }
  const a = tr.pts[lo], b = tr.pts[hi];
  const seg = tr.cum[hi] - tr.cum[lo] || 1;
  const k = (s - tr.cum[lo]) / seg;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, angle: Math.atan2(b.y - a.y, b.x - a.x) };
}

/** Pre-render the two walking frames of the pixel ant to offscreen canvases. */
function antFrames(cell: number, dpr: number, color: string) {
  return TOP_ANT.legs.map((legs) => {
    const c = document.createElement("canvas");
    c.width = Math.ceil(TOP_ANT.w * cell * dpr);
    c.height = Math.ceil(TOP_ANT.h * cell * dpr);
    const g = c.getContext("2d")!;
    g.scale(dpr, dpr);
    g.fillStyle = color;
    const f = cell * 0.78;
    for (const [x, y] of [...TOP_ANT.body, ...legs]) g.fillRect(x * cell, y * cell, f, f);
    return c;
  });
}

/* ------------------------------------------------------------------- Scene */

/**
 * Hero backdrop: a slowly turning 3D flower built from pixel dots, with columns
 * of pixel ants that set off from the edges, wander across, and leave.
 * - animates only while on screen and the tab is visible
 * - draws one still frame under prefers-reduced-motion
 * - pointer-events: none, so it never blocks the URL field
 */
export function AntScene({ className, flower = true, flowerX = 0.5, flowerY = 0.52, flowerSize = 0.42, trails = 3, every = 4.5 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const styles = getComputedStyle(document.documentElement);
    const fg = styles.getPropertyValue("--foreground").trim() || "#fafafa";
    const accent = styles.getPropertyValue("--primary").trim() || "#6366f1";
    let dots: FlowerDot[] = [];
    // The flower is rendered onto a coarse pixel grid (LED-matrix look): each cell
    // keeps the brightest dot that lands in it, then draws as one square.
    let G = 6, cols = 0, rows = 0;
    let grid = new Float32Array(0);
    let accentCell = new Uint8Array(0);

    let w = 0, h = 0, raf = 0, running = false, onScreen = true;
    let clock = 0, last = 0, nextSpawn = 0;
    let columns: Column[] = [];
    let frames: HTMLCanvasElement[] = [];
    let cell = 1.5;

    const maxColumns = () => (w < 640 ? 1 : trails);

    function spawn(midway = false) {
      const trail = makeTrail(w, h);
      const count = 3 + Math.floor(Math.random() * 6);
      const offsets: number[] = [];
      let acc = 0;
      for (let i = 0; i < count; i++) {
        offsets.push(acc);
        acc += cell * 26 + Math.random() * cell * 22;
      }
      const speed = 34 + Math.random() * 22;
      const start = midway ? clock - (trail.total * (0.25 + Math.random() * 0.35)) / speed : clock;
      columns.push({ trail, speed, start, offsets, wobble: Math.random() * 10 });
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      cell = w < 640 ? 1.15 : 1.5;
      G = w < 640 ? 5 : 6;
      cols = Math.ceil(w / G);
      rows = Math.ceil(h / G);
      grid = new Float32Array(cols * rows);
      accentCell = new Uint8Array(cols * rows);
      if (flower) dots = buildFlower((Math.min(w, h) * flowerSize) / (G * 0.55));
      frames = antFrames(cell, dpr, fg);
      columns = [];
      spawn(true);
      if (maxColumns() > 1) spawn(true);
      nextSpawn = clock + every * 0.6;
    }

    function drawFlower(t: number) {
      const S = Math.min(w, h) * flowerSize;
      const cx = w * flowerX;
      const cy = h * flowerY;
      const phi = t * 0.14;
      // Camera looks down at ~55° and sways a little, so the petals fan out and the depth reads.
      const e = 0.95 + Math.sin(t * 0.23) * 0.08;
      const ce = Math.cos(e), se = Math.sin(e), cp = Math.cos(phi), sp = Math.sin(phi);
      const D = 3.2;
      const breathe = Math.sin(t * 0.6) * 0.05;
      grid.fill(0);
      accentCell.fill(0);
      let minC = cols, maxC = -1, minR = rows, maxR = -1;

      for (const d of dots) {
        let x: number, y: number, z: number;
        let bright = 1;
        if (d.kind === "petal") {
          // Petal curls upward along its length: direction angle grows linearly with u.
          const a0 = d.tilt + breathe, k = d.curl;
          const a1 = a0 + k * d.u;
          const rho = (d.r * (Math.sin(a1) - Math.sin(a0))) / k;
          const zz = (d.r * (Math.cos(a0) - Math.cos(a1))) / k;
          const half = d.w * Math.sin(Math.PI * Math.pow(d.u, 0.7));
          const l = d.v * half;
          x = rho * Math.cos(d.theta) - l * Math.sin(d.theta);
          y = rho * Math.sin(d.theta) + l * Math.cos(d.theta);
          z = d.z0 + zz + 0.35 * half * d.v * d.v; // edges cup upward
          // Bright petal outlines, dimmer fill: each petal reads as a shape, not noise.
          const edge = Math.abs(d.v) > 0.99 || d.u === 1 ? 1 : 0.38;
          bright = (d.z0 < 0 ? 0.5 : 0.5 + 0.5 * d.u) * edge;
        } else {
          x = d.x; y = d.y; z = d.z;
          bright = d.kind === "stem" ? 0.4 : 1;
        }
        const x1 = x * cp - y * sp;
        const y1 = x * sp + y * cp;
        const up = z * ce + y1 * se;
        const depth = y1 * ce - z * se;
        const f = D / (D + depth);
        const near = Math.max(0, Math.min(1, 0.5 - depth * 0.45));
        // Kept dim: it is a backdrop behind the headline.
        const val = (0.07 + 0.38 * near) * bright;
        const c = Math.floor((cx + x1 * f * S) / G);
        const r = Math.floor((cy - up * f * S) / G);
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue;
        const i = r * cols + c;
        if (val > grid[i]) {
          grid[i] = val;
          accentCell[i] = d.kind === "centre" ? 1 : 0;
        }
        if (c < minC) minC = c;
        if (c > maxC) maxC = c;
        if (r < minR) minR = r;
        if (r > maxR) maxR = r;
      }
      const sq = Math.max(2, Math.round(G * 0.7));
      for (const pass of [0, 1]) {
        ctx!.fillStyle = pass ? accent : fg;
        for (let r = minR; r <= maxR; r++)
          for (let c = minC; c <= maxC; c++) {
            const i = r * cols + c;
            if (!grid[i] || accentCell[i] !== pass) continue;
            ctx!.globalAlpha = grid[i];
            ctx!.fillRect(c * G, r * G, sq, sq);
          }
      }
      ctx!.globalAlpha = 1;
    }

    function drawAnts() {
      const fw = frames[0].width / dpr;
      const fh = frames[0].height / dpr;
      columns = columns.filter((col) => {
        const travelled = (clock - col.start) * col.speed;
        const lastOffset = col.offsets[col.offsets.length - 1];
        if (travelled - lastOffset > col.trail.total) return false;
        col.offsets.forEach((off, i) => {
          const s = travelled - off;
          if (s < 0 || s > col.trail.total) return;
          const p = pointAt(col.trail, s);
          // Ants weave slightly around the trail instead of marching on rails.
          const wob = Math.sin(s * 0.035 + i * 1.9 + col.wobble) * 4;
          const nx = -Math.sin(p.angle), ny = Math.cos(p.angle);
          const frame = frames[Math.floor(s / 6) % 2];
          ctx!.save();
          ctx!.translate(p.x + nx * wob, p.y + ny * wob);
          ctx!.rotate(p.angle + Math.PI / 2);
          ctx!.globalAlpha = w < 640 ? 0.5 : 0.85;
          ctx!.drawImage(frame, -fw / 2, -fh / 2, fw, fh);
          ctx!.restore();
        });
        return true;
      });
    }

    function frame(now: number) {
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      clock += dt;
      if (clock >= nextSpawn && columns.length < maxColumns()) {
        spawn();
        nextSpawn = clock + every * (0.5 + Math.random());
      }
      ctx!.clearRect(0, 0, w, h);
      if (flower) drawFlower(clock);
      drawAnts();
      if (running) raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduced || !onScreen || document.hidden) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    resize();
    if (reduced) {
      clock = 3;
      frame(0);
    } else start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) frame(0);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start(); else stop();
    });
    io.observe(canvas);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [flower, flowerX, flowerY, flowerSize, trails, every]);

  return <canvas ref={canvasRef} aria-hidden className={cn("pointer-events-none absolute inset-0 size-full", className)} />;
}
