/**
 * Procedural voxel flower.
 *
 * Every part of the flower is a smooth mathematical surface or volume
 * (parametric petals and leaves, capsules and ellipsoids for the stem,
 * stamens and pistil). Each one is densely sampled and snapped to a cubic
 * grid, which is what produces the terraced, sculpted look of the reference.
 *
 * Pure data — no three.js imports — so the 2D fallback can reuse it.
 */

export const PART = { petal: 0, stamen: 1, stem: 2, leaf: 3 } as const;
type Part = (typeof PART)[keyof typeof PART];

export interface VoxelFlower {
  count: number;
  /** Grid cell size in world units. */
  size: number;
  /** xyz per voxel (final, assembled position). */
  positions: Float32Array;
  /** Where along its part the voxel sits: 0 at the attachment, 1 at the tip. */
  along: Float32Array;
  /** Per-part phase, so petals and leaves move out of step. */
  phase: Float32Array;
  part: Uint8Array;
  /** 0 (fully exposed) … 1 (deep in a crease). Baked from grid neighbours. */
  occlusion: Float32Array;
  /** Deterministic per-voxel random 0…1. */
  seed: Float32Array;
  /** Occupancy lookup, for face culling in the 2D fallback. */
  has: (ix: number, iy: number, iz: number) => boolean;
  /** Integer grid coordinates, xyz per voxel. */
  cells: Int16Array;
  /** Tint groups, 2 per voxel: (group + 1, spread 0–1). Group 0 = never tinted. Petals are groups 0–5, stamens 6–11. */
  tint: Float32Array;
  /** Stamen geometry (flower-local), so other things — the ant colony — can walk on them. */
  stamens: Stamen[];
  /** Stem axis: top and bottom centre, radius at each end. */
  stem: { top: Vec3; bottom: Vec3; rTop: number; rBottom: number };
}

export type Vec3 = [number, number, number];
export interface Stamen {
  /** Index 0–5; stamen k stands in front of petal k and shares its azimuth. */
  index: number;
  angle: number;
  filament: { from: Vec3; to: Vec3; radius: number };
  anther: { from: Vec3; to: Vec3; radius: number };
}

export const PETAL_GROUP = (petal: number) => petal;
export const STAMEN_GROUP = (stamen: number) => 6 + stamen;

/* ------------------------------------------------------------ helpers */

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const OFF = 512;
const key = (x: number, y: number, z: number) => ((x + OFF) * 1024 + (y + OFF)) * 1024 + (z + OFF);

/** Centerline of a curved blade, defined by its angle from vertical along the length. */
function bladeCurve(length: number, theta0: number, theta1: number, bend: number, steps = 200) {
  const r = new Float32Array(steps + 1);
  const y = new Float32Array(steps + 1);
  const th = new Float32Array(steps + 1);
  let cr = 0;
  let cy = 0;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    // `bend` > 1 keeps the base upright longer and flares late, like a tulip cup.
    const t = theta0 + (theta1 - theta0) * Math.pow(u, bend);
    th[i] = t;
    r[i] = cr;
    y[i] = cy;
    cr += Math.sin(t) * (length / steps);
    cy += Math.cos(t) * (length / steps);
  }
  return {
    at(u: number) {
      const f = Math.min(steps, Math.max(0, u * steps));
      const i = Math.min(steps - 1, Math.floor(f));
      const k = f - i;
      return {
        r: r[i] + (r[i + 1] - r[i]) * k,
        y: y[i] + (y[i + 1] - y[i]) * k,
        theta: th[i] + (th[i + 1] - th[i]) * k,
      };
    },
  };
}

/* ---------------------------------------------------------- generator */

export function generateVoxelFlower({ size, seed = 7 }: { size: number; seed?: number }): VoxelFlower {
  const rand = mulberry32(seed);
  const map = new Map<number, number>();
  const px: number[] = [];
  const meta: number[] = []; // along, phase, part (flattened ×3)
  const tintList: number[] = []; // group + 1, spread (flattened ×2)
  const cellList: number[] = [];
  const inv = 1 / size;

  const add = (x: number, y: number, z: number, part: Part, along: number, phase: number, group = -1, spread = 0) => {
    const ix = Math.round(x * inv);
    const iy = Math.round(y * inv);
    const iz = Math.round(z * inv);
    const k = key(ix, iy, iz);
    if (map.has(k)) return;
    map.set(k, px.length / 3);
    px.push(ix * size, iy * size, iz * size);
    cellList.push(ix, iy, iz);
    meta.push(along, phase, part);
    tintList.push(group + 1, spread);
  };

  const step = size * 0.45; // sample spacing: well under one cell so surfaces stay watertight

  /* Petal: an obovate blade that rises, cups across its width, then flares open. */
  const petal = (o: {
    azimuth: number; length: number; halfWidth: number; theta0: number; theta1: number;
    bend: number; cup: number; base: number; lift: number; phase: number; twist: number; group: number;
  }) => {
    const curve = bladeCurve(o.length, o.theta0, o.theta1, o.bend);
    const ca = Math.cos(o.azimuth);
    const sa = Math.sin(o.azimuth);
    const nu = Math.ceil(o.length / step) + 1;
    const ruffle = rand() * 10;
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      // Narrow claw at the base, widest about 60% along, rounded tip.
      let hw = o.halfWidth * 2.1 * Math.pow(u, 0.55) * Math.pow(1 - u, 0.38);
      hw *= 1 + 0.035 * Math.sin(u * 17 + ruffle); // subtle organic edge
      hw = Math.max(hw, size * 0.6);
      const c = curve.at(u);
      // Tangent (sinθ, cosθ) in the (radial, up) plane; inward normal points toward the axis.
      const nr = -Math.cos(c.theta);
      const ny = Math.sin(c.theta);
      const cup = o.cup * (1 - 0.5 * u); // cupped at the base, flatter where it flares
      const nv = Math.ceil((2 * hw) / step) + 1;
      for (let j = 0; j <= nv; j++) {
        const v = (j / nv) * 2 - 1;
        // Wrap the width around an arc so the petal is a shallow scoop.
        const phi = Math.max(cup, 1e-3);
        const across = (hw * Math.sin(v * phi)) / phi;
        const lift = (hw * (1 - Math.cos(v * phi))) / phi;
        const twist = o.twist * u * v * hw; // gentle asymmetry
        for (let layer = 0; layer < 2; layer++) {
          const d = lift - layer * size * 0.95;
          const r = o.base + c.r + nr * d;
          const y = o.lift + c.y + ny * d + twist;
          // Local frame: radial axis = (cos a, sin a), across axis = (−sin a, cos a).
          add(r * ca - across * sa, y, r * sa + across * ca, PART.petal, u, o.phase, o.group, u);
        }
      }
    }
  };

  /* Leaf: a long tapering blade with a V-fold down its middle. */
  const leaf = (o: {
    azimuth: number; y: number; length: number; halfWidth: number; theta0: number; theta1: number;
    bend: number; fold: number; phase: number; base: number;
  }) => {
    const curve = bladeCurve(o.length, o.theta0, o.theta1, o.bend);
    const ca = Math.cos(o.azimuth);
    const sa = Math.sin(o.azimuth);
    const nu = Math.ceil(o.length / step) + 1;
    for (let i = 0; i <= nu; i++) {
      const u = i / nu;
      const hw = Math.max(size * 0.5, o.halfWidth * Math.min(1, u * 5 + 0.35) * Math.pow(1 - u, 0.75));
      const c = curve.at(u);
      const nr = -Math.cos(c.theta);
      const ny = Math.sin(c.theta);
      const nv = Math.ceil((2 * hw) / step) + 1;
      for (let j = 0; j <= nv; j++) {
        const v = (j / nv) * 2 - 1;
        const across = v * hw;
        const d = Math.abs(v) * hw * o.fold;
        const r = o.base + c.r + nr * d;
        const y = o.y + c.y + ny * d;
        add(r * ca - across * sa, y, r * sa + across * ca, PART.leaf, u, o.phase);
      }
    }
  };

  /* Solid shapes are voxelised as hollow shells — the interior is never seen. */
  const capsule = (
    ax: number, ay: number, az: number, bx: number, by: number, bz: number,
    r0: number, r1: number, part: Part, phase: number,
    tint?: { group: number; from: number; to: number },
  ) => {
    const pad = Math.max(r0, r1) + size;
    const lo = [Math.min(ax, bx) - pad, Math.min(ay, by) - pad, Math.min(az, bz) - pad];
    const hi = [Math.max(ax, bx) + pad, Math.max(ay, by) + pad, Math.max(az, bz) + pad];
    const dx = bx - ax, dy = by - ay, dz = bz - az;
    const len2 = dx * dx + dy * dy + dz * dz;
    for (let x = Math.round(lo[0] * inv); x <= Math.round(hi[0] * inv); x++)
      for (let y = Math.round(lo[1] * inv); y <= Math.round(hi[1] * inv); y++)
        for (let z = Math.round(lo[2] * inv); z <= Math.round(hi[2] * inv); z++) {
          const wx = x * size, wy = y * size, wz = z * size;
          let t = ((wx - ax) * dx + (wy - ay) * dy + (wz - az) * dz) / len2;
          t = Math.min(1, Math.max(0, t));
          const qx = ax + dx * t - wx, qy = ay + dy * t - wy, qz = az + dz * t - wz;
          const dist = Math.sqrt(qx * qx + qy * qy + qz * qz);
          const r = r0 + (r1 - r0) * t;
          if (dist <= r && (r < size * 2.2 || dist > r - size * 1.6)) {
            const along = tint ? tint.from + (tint.to - tint.from) * t : t;
            // Stamens colour from the anther (where ants arrive) back down the filament.
            add(wx, wy, wz, part, along, phase, tint ? tint.group : -1, 1 - along);
          }
        }
  };

  const ellipsoid = (cx: number, cy: number, cz: number, rx: number, ry: number, rz: number, part: Part, along: number, phase: number) => {
    for (let x = Math.round((cx - rx) * inv) - 1; x <= Math.round((cx + rx) * inv) + 1; x++)
      for (let y = Math.round((cy - ry) * inv) - 1; y <= Math.round((cy + ry) * inv) + 1; y++)
        for (let z = Math.round((cz - rz) * inv) - 1; z <= Math.round((cz + rz) * inv) + 1; z++) {
          const ex = (x * size - cx) / rx, ey = (y * size - cy) / ry, ez = (z * size - cz) / rz;
          const d = Math.sqrt(ex * ex + ey * ey + ez * ez);
          const shell = 1 - (size * 1.6) / Math.min(rx, ry, rz);
          if (d <= 1 && d > shell) add(x * size, y * size, z * size, part, along, phase);
        }
  };

  /* ---- Petals: three outer, three inner, offset by 60°. */
  const jitter = (a: number) => (rand() - 0.5) * 2 * a;
  for (let i = 0; i < 3; i++) {
    petal({
      azimuth: (i / 3) * Math.PI * 2 + jitter(0.08),
      length: 1.75 * (1 + jitter(0.06)),
      halfWidth: 0.74 * (1 + jitter(0.05)),
      theta0: 0.78, theta1: 1.78 + jitter(0.08), bend: 1.25,
      cup: 1.2, base: 0.12, lift: -0.05, phase: i * 2.1, twist: jitter(0.12), group: PETAL_GROUP(i * 2),
    });
  }
  for (let i = 0; i < 3; i++) {
    petal({
      azimuth: ((i + 0.5) / 3) * Math.PI * 2 + jitter(0.08),
      length: 1.55 * (1 + jitter(0.06)),
      halfWidth: 0.68 * (1 + jitter(0.05)),
      theta0: 0.5, theta1: 1.55 + jitter(0.08), bend: 1.4,
      cup: 1.35, base: 0.07, lift: 0.02, phase: 1 + i * 2.1, twist: jitter(0.12), group: PETAL_GROUP(i * 2 + 1),
    });
  }

  /* ---- Reproductive centre: ovary, pistil with a three-lobed stigma, six stamens. */
  ellipsoid(0, 0.32, 0, 0.12, 0.3, 0.12, PART.stamen, 0.2, 0);
  capsule(0, 0.5, 0, 0, 1.15, 0, 0.05, 0.045, PART.stamen, 0);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.5;
    ellipsoid(Math.cos(a) * 0.07, 1.22, Math.sin(a) * 0.07, 0.07, 0.11, 0.07, PART.stamen, 1, 0);
  }
  const stamens: Stamen[] = [];
  for (let k = 0; k < 6; k++) {
    // One stamen in front of each petal, alternating slightly taller and shorter.
    const a = (k / 6) * Math.PI * 2 + jitter(0.06);
    const reach = (k % 2 ? 0.26 : 0.31) * (1 + jitter(0.05));
    const top = (k % 2 ? 0.58 : 0.66) + jitter(0.03);
    const c = Math.cos(a), sn = Math.sin(a);
    const filament = { from: [c * 0.08, 0.1, sn * 0.08] as Vec3, to: [c * reach, top, sn * reach] as Vec3, radius: 0.035 };
    // Anther: elongated, leaning outward along the filament.
    const anther = {
      from: [c * reach * 0.96, top - 0.02, sn * reach * 0.96] as Vec3,
      to: [c * reach * 1.2, top + 0.34, sn * reach * 1.2] as Vec3,
      radius: 0.065,
    };
    const g = STAMEN_GROUP(k);
    capsule(...filament.from, ...filament.to, 0.035, 0.03, PART.stamen, k, { group: g, from: 0, to: 0.55 });
    capsule(...anther.from, ...anther.to, 0.065, 0.055, PART.stamen, k, { group: g, from: 0.55, to: 1 });
    stamens.push({ index: k, angle: a, filament, anther });
  }

  /* ---- Stem, with a slight lean, and a calyx collar. */
  const stem = { top: [0, -0.05, 0] as Vec3, bottom: [0.06, -4.6, 0.04] as Vec3, rTop: 0.15, rBottom: 0.17 };
  capsule(...stem.top, ...stem.bottom, stem.rTop, stem.rBottom, PART.stem, 0);
  ellipsoid(0, -0.02, 0, 0.21, 0.17, 0.21, PART.stem, 0, 0);

  /* ---- Leaves: long blades wrapping the stem — some rise beside the flower, some arch away. */
  const leaves = [
    { azimuth: 2.6, y: -3.2, length: 3.9, halfWidth: 0.17, theta0: 0.12, theta1: 0.95, bend: 1.4, fold: 0.45 },
    { azimuth: -0.35, y: -3.0, length: 3.6, halfWidth: 0.16, theta0: 0.16, theta1: 1.05, bend: 1.3, fold: 0.45 },
    { azimuth: 1.0, y: -2.6, length: 2.7, halfWidth: 0.19, theta0: 0.3, theta1: 1.65, bend: 1.2, fold: 0.4 },
    { azimuth: 3.9, y: -2.4, length: 2.5, halfWidth: 0.18, theta0: 0.34, theta1: 1.75, bend: 1.1, fold: 0.4 },
    { azimuth: 5.0, y: -3.4, length: 2.6, halfWidth: 0.17, theta0: 0.22, theta1: 1.4, bend: 1.3, fold: 0.42 },
  ];
  leaves.forEach((l, i) => leaf({ ...l, phase: i * 1.7 + 0.4, base: 0.12 }));

  /* ---- Pack + bake neighbour occlusion. */
  const count = px.length / 3;
  const positions = new Float32Array(px);
  const cells = new Int16Array(cellList);
  const along = new Float32Array(count);
  const phase = new Float32Array(count);
  const part = new Uint8Array(count);
  const occlusion = new Float32Array(count);
  const seeds = new Float32Array(count);
  const has = (x: number, y: number, z: number) => map.has(key(x, y, z));

  for (let i = 0; i < count; i++) {
    along[i] = meta[i * 3];
    phase[i] = meta[i * 3 + 1];
    part[i] = meta[i * 3 + 2];
    seeds[i] = rand();
    const cx = cells[i * 3], cy = cells[i * 3 + 1], cz = cells[i * 3 + 2];
    let n = 0;
    let w = 0;
    // Look two cells out; nearer neighbours count more. Upward neighbours shade more (sky light).
    for (let dx = -2; dx <= 2; dx++)
      for (let dy = -2; dy <= 2; dy++)
        for (let dz = -2; dz <= 2; dz++) {
          if (!dx && !dy && !dz) continue;
          const weight = (1 / (dx * dx + dy * dy + dz * dz)) * (dy > 0 ? 1.6 : 1);
          w += weight;
          if (has(cx + dx, cy + dy, cz + dz)) n += weight;
        }
    occlusion[i] = Math.min(1, n / w / 0.55);
  }

  return { count, size, positions, along, phase, part, occlusion, seed: seeds, has, cells, tint: new Float32Array(tintList), stamens, stem };
}
