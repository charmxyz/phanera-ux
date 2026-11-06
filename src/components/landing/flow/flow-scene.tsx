"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { VoxelLights, voxelGl } from "@/components/voxel/voxel-stage";
import { buildVoxelAnt, hideAnt, writeAnt } from "@/components/landing/ants/voxel-ant";

/**
 * Isometric story in one loop: a column of ants walks across a voxel website, a red flag
 * pops up where they get stuck, and ranked fix tickets stack up on the right.
 */
export interface FlowSceneProps {
  lite: boolean;
  still: boolean;
  active: boolean;
  onReady?: () => void;
}

const WHITE = "#ffffff";
const INK = "#16161a";
const LINE = "#d9d9de";
const RED = "#dc2626";
const AMBER = "#d97706";
const GREY = "#a1a1aa";

/* The website tile: x −5.2…0.8, z −1.9…1.9, thin slab with raised UI blocks. */
const SITE = { x0: -5.2, x1: 0.8, z0: -1.9, z1: 1.9, h: 0.14 };
const PATH = { from: -9, to: 3.4, z: 0.55 };
/** Where the visitors get stuck (the flag). */
const STUCK = { x: -1.55, z: -0.35 };
const CYCLE = 12; // seconds per ticket loop
const UP_VEC = [0, 1, 0];

function Box({ p, s, c, cast = true }: { p: [number, number, number]; s: [number, number, number]; c: string; cast?: boolean }) {
  return (
    <mesh position={p} castShadow={cast} receiveShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={0.75} />
    </mesh>
  );
}

function Website() {
  const top = SITE.h;
  const cx = (SITE.x0 + SITE.x1) / 2;
  const w = SITE.x1 - SITE.x0;
  const d = SITE.z1 - SITE.z0;
  const ui = 0.06;
  return (
    <group>
      {/* Slab + browser bar */}
      <Box p={[cx, top / 2, 0]} s={[w, top, d]} c={WHITE} />
      <Box p={[cx, top + 0.03, SITE.z0 + 0.22]} s={[w, 0.06, 0.44]} c="#f1f1f3" cast={false} />
      {[0, 1, 2].map((i) => <Box key={i} p={[SITE.x0 + 0.3 + i * 0.22, top + 0.08, SITE.z0 + 0.22]} s={[0.12, 0.06, 0.12]} c={LINE} cast={false} />)}
      {/* Nav links */}
      {[0, 1, 2, 3].map((i) => <Box key={i} p={[SITE.x1 - 0.5 - i * 0.62, top + ui / 2, SITE.z0 + 0.75]} s={[0.42, ui, 0.12]} c={LINE} cast={false} />)}
      {/* Headline + body lines */}
      <Box p={[SITE.x0 + 1.55, top + 0.06, -0.55]} s={[2.4, 0.12, 0.34]} c={INK} />
      {[0, 1].map((i) => <Box key={i} p={[SITE.x0 + 1.3 - i * 0.2, top + ui / 2, -0.05 + i * 0.26]} s={[1.9 - i * 0.4, ui, 0.1]} c={LINE} cast={false} />)}
      {/* Call to action, right where the flag goes up */}
      <Box p={[STUCK.x, top + 0.07, STUCK.z]} s={[0.9, 0.14, 0.34]} c={INK} />
      {/* Feature cards */}
      {[0, 1, 2].map((i) => <Box key={i} p={[SITE.x0 + 0.85 + i * 1.6, top + 0.05, 1.35]} s={[1.3, 0.1, 0.65]} c="#f4f4f6" />)}
    </group>
  );
}

/** Red flag that pops up where visitors get stuck, pulsing gently. */
function StuckFlag({ still }: { still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    const t = still ? 6 : clock.elapsedTime % CYCLE;
    const up = THREE.MathUtils.smoothstep(t, 1.6, 2.2);
    g.scale.setScalar(Math.max(0.0001, up));
    g.position.y = SITE.h + 0.14 + up * (0.05 + (still ? 0 : Math.sin(clock.elapsedTime * 3) * 0.04));
  });
  return (
    <group ref={ref} position={[STUCK.x + 0.15, SITE.h + 0.14, STUCK.z - 0.05]}>
      <Box p={[0, 0.45, 0]} s={[0.05, 0.9, 0.05]} c={INK} />
      <Box p={[0.2, 0.78, 0]} s={[0.36, 0.24, 0.05]} c={RED} />
    </group>
  );
}

/** Ranked fix tickets dropping onto a stack, one per few seconds of the loop. */
function Tickets({ still }: { still: boolean }) {
  const refs = useRef<(THREE.Group | null)[]>([]);
  const cards = [
    { c: RED, y: 0.12 },
    { c: AMBER, y: 0.36 },
    { c: GREY, y: 0.6 },
  ];
  useFrame(({ clock }) => {
    const t = still ? 11 : clock.elapsedTime % CYCLE;
    cards.forEach((card, i) => {
      const g = refs.current[i];
      if (!g) return;
      const start = 3.2 + i * 2.2;
      const k = THREE.MathUtils.smoothstep(t, start, start + 0.5);
      const out = still ? 0 : THREE.MathUtils.smoothstep(t, CYCLE - 0.6, CYCLE);
      g.visible = k > 0.001 && out < 0.999;
      g.position.y = card.y + (1 - k) * 1.4 + out * 0.3;
      g.scale.setScalar(Math.max(0.0001, 1 - out));
    });
  });
  return (
    <group position={[4.7, 0, 0.1]}>
      {cards.map((card, i) => (
        <group key={i} ref={(g) => { refs.current[i] = g; }} rotation-y={-0.06 * i}>
          <Box p={[0, 0, 0]} s={[2.1, 0.16, 1.35]} c={WHITE} />
          <Box p={[-0.86, 0.1, 0]} s={[0.18, 0.06, 1.0]} c={card.c} cast={false} />
          {[0, 1].map((j) => <Box key={j} p={[0.15 - j * 0.15, 0.1, -0.22 + j * 0.34]} s={[1.3 - j * 0.3, 0.04, 0.12]} c={LINE} cast={false} />)}
        </group>
      ))}
    </group>
  );
}

/** Height of the walking surface: ground, ramping up onto the website slab. */
function surfaceY(x: number, z: number) {
  const ramp = 0.25;
  const inX = THREE.MathUtils.smoothstep(x, SITE.x0 - ramp, SITE.x0 + ramp) * (1 - THREE.MathUtils.smoothstep(x, SITE.x1 - ramp, SITE.x1 + ramp));
  const inZ = z > SITE.z0 && z < SITE.z1 ? 1 : 0;
  return SITE.h * inX * inZ;
}

function Ants({ lite, still, onReady }: { lite: boolean; still: boolean; onReady?: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const tpl = useMemo(() => buildVoxelAnt(lite ? 0.075 : 0.06), [lite]);
  const count = lite ? 6 : 9;
  const geometry = useMemo(() => new THREE.BoxGeometry(tpl.size * 0.9, tpl.size * 0.9, tpl.size * 0.9), [tpl]);
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }), []);
  useEffect(() => () => { geometry.dispose(); material.dispose(); }, [geometry, material]);

  const speed = 1.1;
  const span = PATH.to - PATH.from;
  const period = span / speed;
  const scale = 0.27;
  const draw = (time: number) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const arr = mesh.instanceMatrix.array as Float32Array;
    const pos = [0, 0, 0];
    const fwd = [1, 0, 0];
    for (let i = 0; i < count; i++) {
      const base = i * tpl.count;
      const along = ((time + (i * period) / count) % period) * speed; // 0…span
      const x = PATH.from + along;
      // Ants detour around the stuck spot: a little bunching and a wobble near the flag.
      const nearStuck = Math.exp(-((x - STUCK.x) ** 2) / 0.6);
      const z = PATH.z + Math.sin(x * 0.7 + i * 1.7) * 0.22 - nearStuck * 0.5 * Math.sin(i * 2.3 + time * 2);
      const dz = 0.7 * 0.22 * Math.cos(x * 0.7 + i * 1.7);
      const len = Math.hypot(1, dz);
      if (along < 0.05 || along > span - 0.05) {
        hideAnt(arr, base, tpl);
        continue;
      }
      pos[0] = x; pos[1] = surfaceY(x, z); pos[2] = z;
      fwd[0] = 1 / len; fwd[1] = 0; fwd[2] = dz / len;
      writeAnt(arr, base, tpl, pos, fwd, UP_VEC, scale, along * 9 + i);
    }
    mesh.instanceMatrix.needsUpdate = true;
  };

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let a = 0; a < count; a++)
      for (let i = 0; i < tpl.count; i++) {
        const v = (1 - tpl.occlusion[i] * 0.45) * 0.22; // dark ants read well on white
        mesh.setColorAt(a * tpl.count + i, c.setRGB(v, v, v * 1.05));
      }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    draw(still ? 4.5 : 0);
    onReady?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tpl, count]);

  useFrame(({ clock }) => {
    if (!still) draw(clock.elapsedTime);
  });

  return <instancedMesh ref={meshRef} args={[geometry, material, count * tpl.count]} castShadow={!lite} frustumCulled={false} />;
}

/** Isometric orthographic camera that keeps the whole story in frame at any width. */
function IsoCamera() {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  useLayoutEffect(() => {
    const camera = get().camera as THREE.OrthographicCamera;
    camera.position.set(9 - 1.2, 9.5, 11 + 0.4);
    camera.lookAt(-1.2, 0, 0.4);
    // Frame the whole story (ants entering → website → tickets) at any width.
    camera.zoom = Math.min(width / 12.5, height / 6.6);
    camera.updateProjectionMatrix();
    get().invalidate();
  }, [get, width, height]);
  return null;
}

export default function FlowScene({ lite, still, active, onReady }: FlowSceneProps) {
  return (
    <Canvas
      orthographic
      dpr={lite ? [1, 1.5] : [1, 2]}
      shadows={lite ? false : "percentage"}
      frameloop={still || !active ? "demand" : "always"}
      camera={{ position: [9, 9.5, 11], zoom: 60, near: 0.1, far: 100 }}
      gl={voxelGl}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <IsoCamera />
      <VoxelLights shadows={!lite} shadowBox={[-10, 10, 8, -8]} keyPosition={[-4, 12, 7]} ambient={1.25} />
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <shadowMaterial transparent opacity={0.12} />
      </mesh>
      <Website />
      <StuckFlag still={still} />
      <Tickets still={still} />
      <Ants lite={lite} still={still} onReady={onReady} />
    </Canvas>
  );
}
