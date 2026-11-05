"use client";

import { useEffect, useRef } from "react";
import { generateVoxelFlower } from "./voxel-flower";

/**
 * Static fallback for browsers without WebGL: the same procedural flower,
 * drawn once with Canvas 2D as shaded cubes (painter's algorithm, hidden faces culled).
 */
export function FlowerFallback() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const flower = generateVoxelFlower({ size: 0.06 });

    const draw = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const yaw = -0.35, pitch = 0.38;
      const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      const rot = (x: number, y: number, z: number): [number, number, number] => {
        const x1 = x * cy + z * sy;
        const z1 = -x * sy + z * cy;
        return [x1, y * cp - z1 * sp, y * sp + z1 * cp];
      };

      const scale = Math.min(h / 5.2, w / 4.8);
      const ox = w / 2;
      const oy = h * 0.4;
      const half = flower.size / 2;

      // Cube corners and faces, rotated once.
      const corners = [-1, 1].flatMap((a) => [-1, 1].flatMap((b) => [-1, 1].map((c) => rot(a * half, b * half, c * half))));
      const idx = (a: number, b: number, c: number) => ((a > 0 ? 1 : 0) << 2) | ((b > 0 ? 1 : 0) << 1) | (c > 0 ? 1 : 0);
      const faces = ([
        [[1, 0, 0], [idx(1, -1, -1), idx(1, 1, -1), idx(1, 1, 1), idx(1, -1, 1)]],
        [[-1, 0, 0], [idx(-1, -1, -1), idx(-1, -1, 1), idx(-1, 1, 1), idx(-1, 1, -1)]],
        [[0, 1, 0], [idx(-1, 1, -1), idx(-1, 1, 1), idx(1, 1, 1), idx(1, 1, -1)]],
        [[0, -1, 0], [idx(-1, -1, -1), idx(1, -1, -1), idx(1, -1, 1), idx(-1, -1, 1)]],
        [[0, 0, 1], [idx(-1, -1, 1), idx(1, -1, 1), idx(1, 1, 1), idx(-1, 1, 1)]],
        [[0, 0, -1], [idx(-1, -1, -1), idx(-1, 1, -1), idx(1, 1, -1), idx(1, -1, -1)]],
      ] as const)
        .map(([n, quad]) => ({ n, quad, rn: rot(n[0], n[1], n[2]) }))
        .filter((f) => f.rn[2] > 0);
      const light = [-0.45, 0.75, 0.5];
      const ll = Math.hypot(light[0], light[1], light[2]);

      const order = Array.from({ length: flower.count }, (_, i) => i);
      const depth = new Float32Array(flower.count);
      const screen = new Float32Array(flower.count * 2);
      for (let i = 0; i < flower.count; i++) {
        const [x, y, z] = rot(flower.positions[i * 3], flower.positions[i * 3 + 1], flower.positions[i * 3 + 2]);
        depth[i] = z;
        screen[i * 2] = ox + x * scale;
        screen[i * 2 + 1] = oy - y * scale;
      }
      order.sort((a, b) => depth[a] - depth[b]);

      ctx.lineJoin = "round";
      ctx.lineWidth = 0.6;
      for (const i of order) {
        const sx = screen[i * 2], sy2 = screen[i * 2 + 1];
        if (sy2 > h + 20 || sy2 < -20 || sx < -20 || sx > w + 20) continue;
        const gx = flower.cells[i * 3], gy = flower.cells[i * 3 + 1], gz = flower.cells[i * 3 + 2];
        for (const f of faces) {
          if (flower.has(gx + f.n[0], gy + f.n[1], gz + f.n[2])) continue;
          const lambert = Math.max(0, (f.rn[0] * light[0] + f.rn[1] * light[1] + f.rn[2] * light[2]) / ll);
          const v = Math.round(255 * (0.66 + 0.34 * lambert) * (1 - flower.occlusion[i] * 0.32));
          ctx.fillStyle = ctx.strokeStyle = `rgb(${v},${v},${Math.min(255, v + 2)})`;
          ctx.beginPath();
          f.quad.forEach((ci, k) => {
            const c = corners[ci];
            const px = sx + c[0] * scale, py = sy2 - c[1] * scale;
            if (k) ctx.lineTo(px, py);
            else ctx.moveTo(px, py);
          });
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return <canvas ref={ref} className="size-full" aria-hidden />;
}
