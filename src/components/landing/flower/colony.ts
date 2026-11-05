/**
 * The ant colony that visits the hero flower.
 *
 * Ants climb the stem in a single column, spiralling around it, split under the
 * bloom, and each climbs a filament to its anther. When the lead ant reaches a
 * stamen, the stamen takes on the discovery tint (anther first), which then floods into the
 * petal behind it. Everything is a pure function of time, so any moment of the
 * sequence (including the finished state) can be rendered directly.
 *
 * All coordinates are flower-local (inside the flower's rotating group).
 */

import { PETAL_GROUP, STAMEN_GROUP, type Stamen, type VoxelFlower } from "./voxel-flower";

export const COLONY = {
  /** Seconds after load when the first ant enters (the stem has assembled by then). */
  start: 2.6,
  /** Walking speed, flower units per second. */
  speed: 0.62,
  /** Distance between ants in the column. */
  spacing: 0.42,
  /** Distance between ants queueing on the same stamen. */
  queueGap: 0.26,
  /** Ant size relative to the template (template is ~1.4 units long). */
  scale: 0.19,
  stamenSeconds: 0.9,
  petalDelay: 0.5,
  petalSeconds: 1.9,
};

/** Stamens the colony visits (each takes the tint) and the petals that follow. */
export const VISITED_STAMENS = [1, 3, 4];
export const TINTED_PETALS = [1, 4];
export const TINT_GROUPS = 12;

type Path = { p: Float32Array; n: Float32Array; cum: Float32Array; total: number };

/* ----------------------------------------------------------------- paths */

function pathFrom(points: number[][], normals: number[][]): Path {
  const N = points.length;
  const p = new Float32Array(N * 3);
  const n = new Float32Array(N * 3);
  const cum = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    p.set(points[i], i * 3);
    const nl = Math.hypot(normals[i][0], normals[i][1], normals[i][2]) || 1;
    n.set([normals[i][0] / nl, normals[i][1] / nl, normals[i][2] / nl], i * 3);
    if (i) cum[i] = cum[i - 1] + Math.hypot(p[i * 3] - p[i * 3 - 3], p[i * 3 + 1] - p[i * 3 - 2], p[i * 3 + 2] - p[i * 3 - 1]);
  }
  return { p, n, cum, total: cum[N - 1] };
}

const STEP = 0.02;

function stamenPath(flower: VoxelFlower, st: Stamen, thetaTop: number): Path {
  const pts: number[][] = [];
  const nrm: number[][] = [];
  const { top, bottom, rTop, rBottom } = flower.stem;
  const stemAt = (y: number) => {
    const u = (top[1] - y) / (top[1] - bottom[1]);
    return { cx: top[0] + (bottom[0] - top[0]) * u, cz: top[2] + (bottom[2] - top[2]) * u, r: rTop + (rBottom - rTop) * u };
  };

  // A — spiral up the stem from below the fold.
  const y0 = -3.4, y1 = -0.34;
  for (let y = y0; y <= y1; y += STEP) {
    const th = thetaTop + (y1 - y) * 0.85;
    const { cx, cz, r } = stemAt(y);
    pts.push([cx + Math.cos(th) * r, y, cz + Math.sin(th) * r]);
    nrm.push([Math.cos(th), 0, Math.sin(th)]);
  }

  // B — walk around the top of the stem to face this stamen.
  let d = st.angle - thetaTop;
  d = Math.atan2(Math.sin(d), Math.cos(d));
  const { cx, cz, r } = stemAt(y1);
  const arcSteps = Math.max(1, Math.ceil((Math.abs(d) * r) / STEP));
  for (let i = 1; i <= arcSteps; i++) {
    const th = thetaTop + (d * i) / arcSteps;
    pts.push([cx + Math.cos(th) * r, y1, cz + Math.sin(th) * r]);
    nrm.push([Math.cos(th), 0, Math.sin(th)]);
  }

  // C — over the calyx and into the cup, in the (radial, up) plane at the stamen's azimuth.
  const ca = Math.cos(st.angle), sa = Math.sin(st.angle);
  const f0 = st.filament.from;
  const P0 = [r, y1], P1 = [0.34, 0.02], P2 = [Math.hypot(f0[0], f0[2]) + st.filament.radius, f0[1]];
  const curveSteps = 40;
  for (let i = 1; i <= curveSteps; i++) {
    const t = i / curveSteps;
    const a = (1 - t) ** 2, b = 2 * (1 - t) * t, c = t * t;
    const pr = a * P0[0] + b * P1[0] + c * P2[0];
    const py = a * P0[1] + b * P1[1] + c * P2[1];
    // Tangent → normal (dy, −dr) keeps the ant's back facing outward/up.
    const dr = 2 * (1 - t) * (P1[0] - P0[0]) + 2 * t * (P2[0] - P1[0]);
    const dy = 2 * (1 - t) * (P1[1] - P0[1]) + 2 * t * (P2[1] - P1[1]);
    pts.push([pr * ca, py, pr * sa]);
    nrm.push([dy * ca, -dr, dy * sa]);
  }

  // D — up the filament, then along the anther, on their outward side.
  for (const seg of [st.filament, st.anther]) {
    const ax = seg.to[0] - seg.from[0], ay = seg.to[1] - seg.from[1], az = seg.to[2] - seg.from[2];
    const len = Math.hypot(ax, ay, az);
    const dx = ax / len, dy = ay / len, dz = az / len;
    const dot = ca * dx + sa * dz;
    const nx = ca - dx * dot, ny = -dy * dot, nz = sa - dz * dot;
    const nl = Math.hypot(nx, ny, nz);
    const steps = Math.ceil(len / STEP);
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const off = seg.radius * 0.95;
      pts.push([
        seg.from[0] + ax * t + (nx / nl) * off,
        seg.from[1] + ay * t + (ny / nl) * off,
        seg.from[2] + az * t + (nz / nl) * off,
      ]);
      nrm.push([nx, ny, nz]);
    }
  }
  return pathFrom(pts, nrm);
}

/* ---------------------------------------------------------------- colony */

export interface Colony {
  ants: { path: Path; delay: number; stop: number }[];
  /** Time the lead ant reaches each visited stamen, keyed by stamen index. */
  arrival: Map<number, number>;
}

export function buildColony(flower: VoxelFlower, antCount: number): Colony {
  const thetaTop = flower.stamens[VISITED_STAMENS[0]].angle - 0.6;
  const paths = VISITED_STAMENS.map((k) => stamenPath(flower, flower.stamens[k], thetaTop));
  const ants: Colony["ants"] = [];
  const arrival = new Map<number, number>();
  const V = VISITED_STAMENS.length;
  for (let k = 0; k < antCount; k++) {
    const slot = k % V;
    const rank = Math.floor(k / V);
    const path = paths[slot];
    // Lead ant stops just below the anther tip (so the tinted tip shows); later ants queue behind.
    const stop = path.total - 0.3 - rank * COLONY.queueGap;
    const delay = k * COLONY.spacing;
    ants.push({ path, delay, stop });
    if (rank === 0) arrival.set(VISITED_STAMENS[slot], COLONY.start + (stop + delay) / COLONY.speed);
  }
  return { ants, arrival };
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Per-group tint progress (0 → 1) at time `t`, written into `out` (length TINT_GROUPS). */
export function colonyTint(colony: Colony, t: number, out: Float32Array) {
  out.fill(0);
  for (const [k, at] of colony.arrival) {
    out[STAMEN_GROUP(k)] = clamp01((t - at) / COLONY.stamenSeconds);
    if (TINTED_PETALS.includes(k)) out[PETAL_GROUP(k)] = clamp01((t - at - COLONY.petalDelay) / COLONY.petalSeconds);
  }
}

export interface AntPose {
  visible: boolean;
  pos: [number, number, number];
  fwd: [number, number, number];
  up: [number, number, number];
  stride: number;
}

/** Where ant `i` is at time `t`. */
export function antPose(colony: Colony, i: number, t: number, out: AntPose) {
  const ant = colony.ants[i];
  const walked = (t - COLONY.start) * COLONY.speed - ant.delay;
  if (walked < 0) {
    out.visible = false;
    return;
  }
  const parked = walked >= ant.stop;
  const s = Math.min(walked, ant.stop);
  const { p, n, cum } = ant.path;
  let lo = 0, hi = cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] < s) lo = mid; else hi = mid;
  }
  const k = (s - cum[lo]) / (cum[hi] - cum[lo] || 1);
  for (let j = 0; j < 3; j++) {
    out.pos[j] = p[lo * 3 + j] + (p[hi * 3 + j] - p[lo * 3 + j]) * k;
    out.up[j] = n[lo * 3 + j] + (n[hi * 3 + j] - n[lo * 3 + j]) * k;
    out.fwd[j] = p[hi * 3 + j] - p[lo * 3 + j];
  }
  const fl = Math.hypot(out.fwd[0], out.fwd[1], out.fwd[2]) || 1;
  out.fwd[0] /= fl; out.fwd[1] /= fl; out.fwd[2] /= fl;
  // Gait follows distance walked; parked ants just shuffle their feet a little.
  out.stride = (s / COLONY.scale) * 7.5 + (parked ? Math.sin(t * 2.2 + i) * 0.25 : 0);
  out.visible = true;
}
