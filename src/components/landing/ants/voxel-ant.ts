/**
 * Voxel ant template, in the ant's local frame: forward is +x, up is +y, ground at y = 0.
 * Built like the flower: smooth shapes (ellipsoids, capsules) snapped to a cube grid.
 */

export interface AntTemplate {
  size: number;
  count: number;
  /** Local xyz per cube. */
  positions: Float32Array;
  /** −1 for body cubes, otherwise the leg index 0–5. */
  leg: Int8Array;
  /** Leg hip pivots, xyz per leg. */
  hips: Float32Array;
  /** For leg cubes: 0 at the hip → 1 at the foot (how much the cube lifts mid-stride). */
  reach: Float32Array;
  /** 0…1 baked occlusion. */
  occlusion: Float32Array;
}

export function buildVoxelAnt(size: number): AntTemplate {
  const inv = 1 / size;
  const map = new Map<string, number>();
  const pos: number[] = [];
  const legOf: number[] = [];
  const reachOf: number[] = [];

  const add = (x: number, y: number, z: number, leg: number, reach: number) => {
    const ix = Math.round(x * inv), iy = Math.round(y * inv), iz = Math.round(z * inv);
    const k = `${ix},${iy},${iz}`;
    if (map.has(k)) return;
    map.set(k, legOf.length);
    pos.push(ix * size, iy * size, iz * size);
    legOf.push(leg);
    reachOf.push(reach);
  };

  const ellipsoid = (cx: number, cy: number, cz: number, rx: number, ry: number, rz: number) => {
    const shell = 1 - (size * 1.6) / Math.min(rx, ry, rz);
    for (let x = Math.floor((cx - rx) * inv); x <= Math.ceil((cx + rx) * inv); x++)
      for (let y = Math.floor((cy - ry) * inv); y <= Math.ceil((cy + ry) * inv); y++)
        for (let z = Math.floor((cz - rz) * inv); z <= Math.ceil((cz + rz) * inv); z++) {
          const ex = (x * size - cx) / rx, ey = (y * size - cy) / ry, ez = (z * size - cz) / rz;
          const d = Math.sqrt(ex * ex + ey * ey + ez * ez);
          if (d <= 1 && d > shell) add(x * size, y * size, z * size, -1, 0);
        }
  };

  /** Dense samples along a segment — thin limbs stay connected on the grid. */
  const limb = (a: number[], b: number[], leg: number, r0: number, r1: number) => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const n = Math.ceil(len / (size * 0.3));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      add(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, leg, r0 + (r1 - r0) * t);
    }
  };

  // Body: head, thorax, waist, abdomen.
  ellipsoid(0.6, 0.3, 0, 0.17, 0.15, 0.16);
  ellipsoid(0.26, 0.27, 0, 0.21, 0.12, 0.12);
  ellipsoid(0.03, 0.26, 0, 0.07, 0.07, 0.07);
  ellipsoid(-0.36, 0.33, 0, 0.34, 0.23, 0.25);
  // Mandibles and antennae (elbowed).
  for (const s of [-1, 1]) {
    limb([0.74, 0.24, s * 0.06], [0.82, 0.22, s * 0.02], -2, 0, 0);
    limb([0.68, 0.4, s * 0.07], [0.8, 0.62, s * 0.15], -2, 0, 0);
    limb([0.8, 0.62, s * 0.15], [1.04, 0.52, s * 0.3], -2, 0, 0);
  }

  // Legs: three pairs from the thorax. Leg index = pair * 2 + (side > 0 ? 1 : 0).
  const hips: number[] = [];
  const pairs = [
    { hx: 0.36, dx: 0.32 },
    { hx: 0.26, dx: 0.02 },
    { hx: 0.16, dx: -0.36 },
  ];
  pairs.forEach(({ hx, dx }, p) => {
    for (const s of [-1, 1]) {
      const leg = p * 2 + (s > 0 ? 1 : 0);
      const hip = [hx, 0.22, s * 0.09];
      const knee = [hx + dx * 0.5, 0.42, s * 0.36];
      const foot = [hx + dx, 0, s * 0.56];
      hips.push(...hip);
      limb(hip, knee, leg, 0, 0.45);
      limb(knee, foot, leg, 0.45, 1);
    }
  });

  const count = legOf.length;
  const positions = new Float32Array(pos);
  const occlusion = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const ix = Math.round(positions[i * 3] * inv), iy = Math.round(positions[i * 3 + 1] * inv), iz = Math.round(positions[i * 3 + 2] * inv);
    let n = 0;
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      if ((dx || dy || dz) && map.has(`${ix + dx},${iy + dy},${iz + dz}`)) n += dy > 0 ? 1.5 : 1;
    }
    occlusion[i] = Math.min(1, n / 16);
  }

  return {
    size,
    count,
    positions,
    leg: Int8Array.from(legOf.map((l) => (l < 0 ? -1 : l))),
    hips: new Float32Array(hips),
    reach: new Float32Array(reachOf),
    occlusion,
  };
}

/**
 * Writes one ant's cube matrices into an instance-matrix array.
 *
 * The ant stands at `origin` with its feet on the surface, facing `forward`, with
 * `up` the surface normal (both unit vectors, roughly perpendicular) — so ants can
 * walk on the ground, up a stem or along a filament. `stride` is the gait phase
 * (radians); tie it to distance walked so feet don't slide.
 */
export function writeAnt(
  arr: Float32Array,
  firstInstance: number,
  tpl: AntTemplate,
  origin: ArrayLike<number>,
  forward: ArrayLike<number>,
  upIn: ArrayLike<number>,
  scale: number,
  stride: number,
) {
  // Orthonormal frame: f (local +x), u (local +y), s = f × u (local +z).
  const fx = forward[0], fy = forward[1], fz = forward[2];
  const d = upIn[0] * fx + upIn[1] * fy + upIn[2] * fz;
  let ux = upIn[0] - fx * d, uy = upIn[1] - fy * d, uz = upIn[2] - fz * d;
  const ul = Math.hypot(ux, uy, uz) || 1;
  ux /= ul; uy /= ul; uz /= ul;
  const sx = fy * uz - fz * uy, sy = fz * ux - fx * uz, sz = fx * uy - fy * ux;

  const bob = Math.abs(Math.sin(stride)) * 0.012;
  for (let i = 0; i < tpl.count; i++) {
    let lx = tpl.positions[i * 3], ly = tpl.positions[i * 3 + 1] + bob, lz = tpl.positions[i * 3 + 2];
    const leg = tpl.leg[i];
    if (leg >= 0) {
      // Tripod gait: legs 0, 3, 4 move together; 1, 2, 5 in anti-phase.
      const phase = stride + (leg === 0 || leg === 3 || leg === 4 ? 0 : Math.PI);
      const swing = Math.sin(phase) * 0.42;
      const lift = Math.max(0, Math.cos(phase)) * 0.09 * tpl.reach[i];
      const hx = tpl.hips[leg * 3], hz = tpl.hips[leg * 3 + 2];
      const rx = lx - hx, rz = lz - hz;
      const cs = Math.cos(swing), sn = Math.sin(swing);
      lx = hx + rx * cs - rz * sn;
      lz = hz + rx * sn + rz * cs;
      ly += lift - bob;
    }
    lx *= scale; ly *= scale; lz *= scale;
    const o = (firstInstance + i) * 16;
    arr[o] = fx * scale; arr[o + 1] = fy * scale; arr[o + 2] = fz * scale; arr[o + 3] = 0;
    arr[o + 4] = ux * scale; arr[o + 5] = uy * scale; arr[o + 6] = uz * scale; arr[o + 7] = 0;
    arr[o + 8] = sx * scale; arr[o + 9] = sy * scale; arr[o + 10] = sz * scale; arr[o + 11] = 0;
    arr[o + 12] = origin[0] + fx * lx + ux * ly + sx * lz;
    arr[o + 13] = origin[1] + fy * lx + uy * ly + sy * lz;
    arr[o + 14] = origin[2] + fz * lx + uz * ly + sz * lz;
    arr[o + 15] = 1;
  }
}

/** Zero an ant's matrices (hides it). */
export function hideAnt(arr: Float32Array, firstInstance: number, tpl: AntTemplate) {
  arr.fill(0, firstInstance * 16, (firstInstance + tpl.count) * 16);
}
