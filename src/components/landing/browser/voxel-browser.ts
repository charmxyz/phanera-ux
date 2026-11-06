/**
 * A voxel browser window, built like the hero flower: small cubes on a grid.
 * Window-local coordinates: u runs left → right (0…W), v top → bottom (0…H).
 * World: x = u − W/2, y = H/2 − v, z = layer × size (layer 0 is the front face).
 */

export const WIN = { W: 3.6, H: 2.4 };

/** Interface elements raised from the face. `group` ≥ 0 marks an element that tints when the colony finds an issue there. */
type El = { u0: number; v0: number; u1: number; v1: number; h: number; round?: number; dot?: boolean; group?: number; shade?: number };

export const ISSUE_GROUPS = 2;
const ELEMENTS: El[] = [
  // Browser chrome: traffic lights + address bar
  { u0: 0.14, v0: 0.11, u1: 0.25, v1: 0.22, h: 2, dot: true, shade: 0.72 },
  { u0: 0.3, v0: 0.11, u1: 0.41, v1: 0.22, h: 2, dot: true, shade: 0.72 },
  { u0: 0.46, v0: 0.11, u1: 0.57, v1: 0.22, h: 2, dot: true, shade: 0.72 },
  { u0: 0.85, v0: 0.09, u1: 2.75, v1: 0.24, h: 2, round: 0.07 },
  // Hero: headline (ink), two body lines, primary button (issue 0), secondary link, image
  { u0: 0.3, v0: 0.56, u1: 2.0, v1: 0.78, h: 3, round: 0.03, shade: 0.24 },
  { u0: 0.3, v0: 0.9, u1: 1.75, v1: 0.98, h: 2, shade: 0.62 },
  { u0: 0.3, v0: 1.05, u1: 1.4, v1: 1.13, h: 2, shade: 0.62 },
  { u0: 0.3, v0: 1.26, u1: 1.06, v1: 1.48, h: 4, round: 0.08, group: 0 },
  { u0: 1.2, v0: 1.33, u1: 1.68, v1: 1.41, h: 2, shade: 0.5 },
  { u0: 2.25, v0: 0.56, u1: 3.3, v1: 1.48, h: 2, round: 0.06 },
  // Feature cards (the middle one is issue 1)
  { u0: 0.3, v0: 1.72, u1: 1.24, v1: 2.2, h: 2, round: 0.06 },
  { u0: 1.33, v0: 1.72, u1: 2.27, v1: 2.2, h: 3, round: 0.06, group: 1 },
  { u0: 2.36, v0: 1.72, u1: 3.3, v1: 2.2, h: 2, round: 0.06 },
];

function inRoundRect(u: number, v: number, u0: number, v0: number, u1: number, v1: number, r: number) {
  if (u < u0 || u > u1 || v < v0 || v > v1) return false;
  const cx = Math.min(Math.max(u, u0 + r), u1 - r);
  const cy = Math.min(Math.max(v, v0 + r), v1 - r);
  return (u - cx) ** 2 + (v - cy) ** 2 <= r * r + 1e-9;
}

function inElement(e: El, u: number, v: number) {
  if (e.dot) {
    const cu = (e.u0 + e.u1) / 2, cv = (e.v0 + e.v1) / 2, r = (e.u1 - e.u0) / 2;
    return (u - cu) ** 2 + (v - cv) ** 2 <= r * r;
  }
  return inRoundRect(u, v, e.u0, e.v0, e.u1, e.v1, e.round ?? 0);
}

export interface VoxelBrowser {
  count: number;
  size: number;
  positions: Float32Array;
  /** Assembly order 0…1 (top of the window first, interface after the panel). */
  order: Float32Array;
  occlusion: Float32Array;
  /** Base tone 0…1 (1 = white; interface "ink" is darker). */
  shade: Float32Array;
  seed: Float32Array;
  /** (group + 1, spread 0…1) per cube, for the issue tint; 0 = never tinted. */
  tint: Float32Array;
  /** Height of the walkable surface (in layers) at window-local (u, v). */
  heightAt: (u: number, v: number) => number;
}

export function generateVoxelBrowser({ size }: { size: number }): VoxelBrowser {
  const { W, H } = WIN;
  const nx = Math.round(W / size), ny = Math.round(H / size);
  const pos: number[] = [], ord: number[] = [], occ: number[] = [], sd: number[] = [], tint: number[] = [], shade: number[] = [];
  const height = new Int8Array(nx * ny);
  const cellEl: (El | null)[] = new Array(nx * ny).fill(null);

  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const u = (i + 0.5) * size, v = (j + 0.5) * size;
      for (const e of ELEMENTS) if (inElement(e, u, v)) { cellEl[j * nx + i] = e; height[j * nx + i] = e.h; }
    }

  let s = 7;
  const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
  const add = (u: number, v: number, layer: number, order: number, o: number, t: [number, number], sh = 1) => {
    pos.push(u - W / 2, H / 2 - v, layer * size);
    ord.push(Math.min(1, Math.max(0, order + (rnd() - 0.5) * 0.05)));
    occ.push(o);
    sd.push(rnd());
    tint.push(t[0], t[1]);
    shade.push(sh);
  };

  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) {
      const u = (i + 0.5) * size, v = (j + 0.5) * size;
      if (!inRoundRect(u, v, 0, 0, W, H, 0.16)) continue;
      const vn = v / H;
      // Panel: two layers, a groove under the browser chrome.
      const groove = Math.abs(v - 0.34) < size * 0.6;
      const h = height[j * nx + i];
      // Soft contact shadow on the panel around raised elements.
      let near = 0;
      if (!h) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const ii = i + di, jj = j + dj;
        if (ii >= 0 && jj >= 0 && ii < nx && jj < ny && height[jj * nx + ii]) near = 1;
      }
      add(u, v, -1, 0.45 * vn, 0.25, [0, 0]);
      if (!groove) add(u, v, 0, 0.02 + 0.45 * vn, near ? 0.22 : 0, [0, 0]);
      const e = cellEl[j * nx + i];
      for (let k = 1; k <= h; k++) {
        const t: [number, number] = e && e.group != null ? [e.group + 1, (u - e.u0) / (e.u1 - e.u0)] : [0, 0];
        add(u, v, k, 0.5 + 0.45 * vn + k * 0.02, 0, t, e?.shade ?? 1);
      }
    }

  const heightAt = (u: number, v: number) => {
    const i = Math.floor(u / size), j = Math.floor(v / size);
    if (i < 0 || j < 0 || i >= nx || j >= ny) return 0;
    return height[j * nx + i];
  };

  return {
    count: ord.length,
    size,
    positions: new Float32Array(pos),
    order: new Float32Array(ord),
    occlusion: new Float32Array(occ),
    shade: new Float32Array(shade),
    seed: new Float32Array(sd),
    tint: new Float32Array(tint),
    heightAt,
  };
}

/* ----------------------------------------------------------------- colony */

/** The route the colony walks across the interface, in window-local (u, v). */
export const ROUTE: [number, number][] = [
  [0.12, 2.32], [0.14, 0.46], [2.12, 0.46], [2.12, 1.4], [1.12, 1.4], [0.68, 1.36],
  [0.68, 1.6], [1.8, 1.62], [1.8, 1.96], [3.42, 1.96], [3.42, 2.3],
];
/** Where on the route (distance) each issue is found: the primary button, then the middle card. */
export const ISSUE_AT = [{ group: 0, u: 0.68, v: 1.36 }, { group: 1, u: 1.8, v: 1.96 }];

export type Route = { pts: [number, number][]; cum: number[]; total: number };
export function buildRoute(pts: [number, number][]): Route {
  const cum = [0];
  for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
  return { pts, cum, total: cum[cum.length - 1] };
}

export function routeAt(r: Route, d: number): { u: number; v: number; du: number; dv: number } {
  const dd = Math.min(Math.max(d, 0), r.total - 1e-6);
  let k = 1;
  while (k < r.cum.length - 1 && r.cum[k] < dd) k++;
  const a = r.pts[k - 1], b = r.pts[k];
  const seg = r.cum[k] - r.cum[k - 1] || 1;
  const t = (dd - r.cum[k - 1]) / seg;
  return { u: a[0] + (b[0] - a[0]) * t, v: a[1] + (b[1] - a[1]) * t, du: (b[0] - a[0]) / seg, dv: (b[1] - a[1]) / seg };
}

/** Distance along the route closest to (u, v). */
export function distanceTo(r: Route, u: number, v: number) {
  let best = 0, bestD = Infinity;
  for (let d = 0; d <= r.total; d += 0.01) {
    const p = routeAt(r, d);
    const dist = (p.u - u) ** 2 + (p.v - v) ** 2;
    if (dist < bestD) { bestD = dist; best = d; }
  }
  return best;
}
