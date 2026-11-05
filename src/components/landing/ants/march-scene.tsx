"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { seededRandom } from "@/components/voxel/voxel-material";
import { VoxelLights, useWindowPointer, voxelGl } from "@/components/voxel/voxel-stage";
import { buildVoxelAnt, hideAnt, writeAnt } from "./voxel-ant";

export interface MarchSceneProps {
  lite: boolean;
  still: boolean;
  active: boolean;
  onReady?: () => void;
}

/* ------------------------------------------------------------------ trails */

type Trail = { pts: Float32Array; cum: Float32Array; total: number };
type Column = { trail: Trail; speed: number; start: number; offsets: number[]; slots: number[] };

/** A gently curving path across the ground (xz) from one side to the other, avoiding the centre band. */
function makeTrail(rnd: () => number, W: number, D: number): Trail {
  const side = rnd() < 0.5 ? -1 : 1;
  const margin = 2.2;
  const band = () => (rnd() < 0.5 ? -1 : 1) * D * (0.18 + rnd() * 0.3);
  const p0 = [side * (W / 2 + margin), band()];
  const p3 = [-side * (W / 2 + margin), band()];
  const p1 = [side * W * (0.1 + rnd() * 0.25), band()];
  const p2 = [-side * W * (0.1 + rnd() * 0.25), band()];
  const N = 120;
  const pts = new Float32Array((N + 1) * 2);
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const a = (1 - t) ** 3, b = 3 * (1 - t) ** 2 * t, c = 3 * (1 - t) * t * t, d = t ** 3;
    pts[i * 2] = a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0];
    pts[i * 2 + 1] = a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1];
  }
  const cum = new Float32Array(N + 1);
  for (let i = 1; i <= N; i++) cum[i] = cum[i - 1] + Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]);
  return { pts, cum, total: cum[N] };
}

function pointAt(tr: Trail, s: number, out: { x: number; z: number; dx: number; dz: number }) {
  let lo = 0, hi = tr.cum.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (tr.cum[mid] < s) lo = mid; else hi = mid;
  }
  const seg = tr.cum[hi] - tr.cum[lo] || 1;
  const k = (s - tr.cum[lo]) / seg;
  const ax = tr.pts[lo * 2], az = tr.pts[lo * 2 + 1], bx = tr.pts[hi * 2], bz = tr.pts[hi * 2 + 1];
  out.x = ax + (bx - ax) * k;
  out.z = az + (bz - az) * k;
  out.dx = (bx - ax) / seg;
  out.dz = (bz - az) / seg;
}

/* -------------------------------------------------------------------- ants */

const ANT_SCALE = 1;
const UP = [0, 1, 0];

function Ants({ lite, still, onReady }: { lite: boolean; still: boolean; onReady?: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const camera = useThree((st) => st.camera);
  const width = useThree((st) => st.size.width);
  const height = useThree((st) => st.size.height);
  const tpl = useMemo(() => buildVoxelAnt(lite ? 0.075 : 0.06), [lite]);
  const maxAnts = lite ? 10 : 22;
  const maxColumns = lite ? 2 : 3;

  const geometry = useMemo(() => new THREE.BoxGeometry(tpl.size * 0.9, tpl.size * 0.9, tpl.size * 0.9), [tpl]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), []);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  // Mutable simulation state lives in a ref; nothing here drives React rendering.
  const sim = useRef<{ columns: Column[]; free: number[]; clock: number; nextSpawn: number; rnd: () => number } | null>(null);

  // Ground area visible to the camera (approximate: the view plane through the origin, stretched by the tilt).
  // Kept in a ref and keyed on width/height only: R3F re-measures the canvas on scroll, and that
  // must never touch the running simulation. A real resize only affects columns spawned afterwards.
  const area = useRef({ W: 24, D: 12 });
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const d = cam.position.length();
    const vh = 2 * d * Math.tan((cam.fov * Math.PI) / 360);
    area.current = { W: vh * (width / Math.max(1, height)), D: vh * 1.35 };
  }, [camera, width, height]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let a = 0; a < maxAnts; a++)
      for (let i = 0; i < tpl.count; i++) {
        const v = 1 - tpl.occlusion[i] * 0.45;
        mesh.setColorAt(a * tpl.count + i, c.setRGB(v, v, v * 1.008));
      }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.instanceMatrix.array.fill(0); // all ants hidden until placed

    const rnd = seededRandom(31);
    const state = { columns: [] as Column[], free: Array.from({ length: maxAnts }, (_, i) => i), clock: 0, nextSpawn: 0, rnd };
    sim.current = state;
    // Start with columns already part-way across so the section is never empty.
    for (let k = 0; k < maxColumns; k++) spawn(state, true);
    state.nextSpawn = 2;
    draw(0);
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl, maxAnts, maxColumns]);

  function spawn(s: NonNullable<typeof sim.current>, midway = false) {
    const want = 3 + Math.floor(s.rnd() * 5);
    const n = Math.min(want, s.free.length);
    if (n < 2) return;
    const trail = makeTrail(s.rnd, area.current.W, area.current.D);
    const offsets: number[] = [];
    let acc = 0;
    for (let i = 0; i < n; i++) {
      offsets.push(acc);
      acc += 2.3 + s.rnd() * 1.2;
    }
    const speed = 0.8 + s.rnd() * 0.35;
    const start = midway ? s.clock - (trail.total * (0.3 + s.rnd() * 0.3)) / speed : s.clock;
    s.columns.push({ trail, speed, start, offsets, slots: s.free.splice(0, n) });
  }

  const p = useMemo(() => ({ x: 0, z: 0, dx: 1, dz: 0 }), []);

  function draw(dt: number) {
    const mesh = meshRef.current;
    const s = sim.current;
    if (!mesh || !s) return;
    s.clock += dt;
    if (!still && s.clock >= s.nextSpawn && s.columns.length < maxColumns) {
      spawn(s);
      s.nextSpawn = s.clock + 3 + s.rnd() * 4;
    }

    const arr = mesh.instanceMatrix.array as Float32Array;
    const pos = [0, 0, 0];
    const fwd = [1, 0, 0];
    s.columns = s.columns.filter((col) => {
      const travelled = (s.clock - col.start) * col.speed;
      const done = travelled - col.offsets[col.offsets.length - 1] > col.trail.total;
      col.offsets.forEach((off, k) => {
        const slot = col.slots[k];
        const base = slot * tpl.count;
        const dist = travelled - off;
        if (done || dist < 0 || dist > col.trail.total) {
          hideAnt(arr, base, tpl);
          return;
        }
        pointAt(col.trail, dist, p);
        fwd[0] = p.dx; fwd[2] = p.dz;
        pos[0] = p.x; pos[2] = p.z;
        // Leg phase follows distance walked, so feet don't slide.
        writeAnt(arr, base, tpl, pos, fwd, UP, ANT_SCALE, dist * 7.5 + k * 0.7);
      });
      if (done) s.free.push(...col.slots);
      return !done;
    });
    mesh.instanceMatrix.needsUpdate = true;
  }

  useFrame((_, delta) => {
    if (!still) draw(Math.min(delta, 0.05));
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, material, maxAnts * tpl.count]}
      castShadow={!lite}
      frustumCulled={false}
    />
  );
}

function Rig({ still }: { still: boolean }) {
  const { camera } = useThree();
  const pointer = useWindowPointer(!still);
  const eased = useRef({ x: 0, y: 0 });
  useFrame((_, delta) => {
    if (still) return;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 1.2);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    camera.position.set(eased.current.x * 0.8, 11, 9 + eased.current.y * 0.4);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function MarchScene({ lite, still, active, onReady }: MarchSceneProps) {
  return (
    <Canvas
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      shadows={lite ? false : "percentage"}
      frameloop={still || !active ? "demand" : "always"}
      camera={{ fov: 30, near: 0.1, far: 80, position: [0, 11, 9] }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0)}
      gl={voxelGl}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Rig still={still} />
      <VoxelLights shadows={!lite} shadowBox={[-16, 16, 12, -12]} keyPosition={[-5, 12, 6]} ambient={1.1} />
      {/* Invisible ground that only catches the ants' soft shadows. */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[80, 60]} />
        <shadowMaterial transparent opacity={0.2} />
      </mesh>
      <Ants lite={lite} still={still} onReady={onReady} />
    </Canvas>
  );
}
