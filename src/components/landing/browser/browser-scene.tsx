"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createVoxelMaterials, setVoxelAttributes, voxelUniforms } from "@/components/voxel/voxel-material";
import { VoxelLights, useWindowPointer, voxelGl } from "@/components/voxel/voxel-stage";
import { buildVoxelAnt, hideAnt, writeAnt } from "@/components/landing/ants/voxel-ant";
import { ISSUE_AT, ISSUE_GROUPS, ROUTE, WIN, buildRoute, distanceTo, generateVoxelBrowser, routeAt } from "./voxel-browser";

export interface BrowserSceneProps {
  lite: boolean;
  still: boolean;
  active: boolean;
  onReady?: () => void;
}

const ISSUE_TINT = "#dc2626";
const ANT_COLOR = "#34343b";
const ASSEMBLE = 3.2;
const SPEED = 0.42; // window units per second
const SPACING = 0.34;
const REST = 2.5; // pause at the end of each colony loop

/** Played once per page load, like the hero flower; later mounts show it assembled. */
let assembledThisSession = false;

function Browser({ lite, still, onReady }: { lite: boolean; still: boolean; onReady?: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const antsRef = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const time = useRef(still || assembledThisSession ? ASSEMBLE : 0);

  const data = useMemo(() => generateVoxelBrowser({ size: lite ? 0.06 : 0.042 }), [lite]);
  const route = useMemo(() => buildRoute(ROUTE), []);
  const issueDist = useMemo(() => ISSUE_AT.map((i) => ({ group: i.group, d: distanceTo(route, i.u, i.v) })), [route]);
  const antCount = lite ? 5 : 8;
  const cycle = (route.total + SPACING * antCount) / SPEED + REST;

  const antTpl = useMemo(() => buildVoxelAnt(0.08), []);
  const antGeometry = useMemo(() => new THREE.BoxGeometry(antTpl.size * 0.9, antTpl.size * 0.9, antTpl.size * 0.9), [antTpl]);
  const antMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: ANT_COLOR, roughness: 0.6 }), []);
  useEffect(() => () => { antGeometry.dispose(); antMaterial.dispose(); }, [antGeometry, antMaterial]);

  const { geometry, material, depthMaterial } = useMemo(() => {
    const g = new THREE.BoxGeometry(data.size * 0.96, data.size * 0.96, data.size * 0.96);
    const anim = new Float32Array(data.count * 4);
    for (let i = 0; i < data.count; i++) {
      anim[i * 4] = data.order[i];
      anim[i * 4 + 3] = data.seed[i];
    }
    setVoxelAttributes(g, { scatter: new Float32Array(data.count * 3), anim, part: new Float32Array(data.count) });
    g.setAttribute("aTint", new THREE.InstancedBufferAttribute(data.tint, 2));
    return {
      geometry: g,
      ...createVoxelMaterials({ key: "browser", still, tint: { groups: ISSUE_GROUPS, color: ISSUE_TINT }, entrance: "grow" }),
    };
  }, [data, still]);
  useEffect(() => () => { geometry.dispose(); material.dispose(); depthMaterial.dispose(); }, [geometry, material, depthMaterial]);

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < data.count; i++) {
      const sd = data.seed[i];
      o.position.set(data.positions[i * 3], data.positions[i * 3 + 1], data.positions[i * 3 + 2] + (sd - 0.5) * data.size * 0.12);
      o.rotation.set(0, 0, ((sd * 3.17) % 1 - 0.5) * 0.04);
      o.scale.setScalar(0.95 + 0.05 * ((sd * 5.71) % 1));
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      const v = data.shade[i] * (1 - data.occlusion[i] * 0.36) * (0.96 + 0.04 * ((sd * 11.3) % 1));
      mesh.setColorAt(i, c.setRGB(v, v, v * 1.008));
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.customDepthMaterial = depthMaterial;
    onReady?.();
  }, [data, depthMaterial, onReady]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    if (!still) time.current += Math.min(delta, 0.1);
    const t = time.current;
    const u = voxelUniforms(mesh);
    u.uTime.value = t;
    u.uProgress.value = Math.min(1, t / ASSEMBLE);
    if (u.uProgress.value >= 1) assembledThisSession = true;

    // Colony loop starts once the window has assembled. Reduced motion: a mid-loop frame.
    const tc = still ? cycle * 0.62 : Math.max(0, t - ASSEMBLE) % cycle;
    const fade = 1 - THREE.MathUtils.smoothstep(tc, cycle - 1.4, cycle);
    if (u.uTint) for (const issue of issueDist) u.uTint.value[issue.group] = Math.min(1, Math.max(0, (tc - issue.d / SPEED) / 1.1)) * fade;

    const ants = antsRef.current;
    if (ants) {
      const arr = ants.instanceMatrix.array as Float32Array;
      const pos = [0, 0, 0], fwd = [1, 0, 0];
      for (let i = 0; i < antCount; i++) {
        const base = i * antTpl.count;
        const d = tc * SPEED - i * SPACING;
        if (d <= 0.02 || d >= route.total - 0.02) {
          hideAnt(arr, base, antTpl);
          continue;
        }
        const p = routeAt(route, d);
        const wob = Math.sin(d * 9 + i * 1.7) * 0.025;
        const uu = p.u - p.dv * wob, vv = p.v + p.du * wob;
        pos[0] = uu - WIN.W / 2;
        pos[1] = WIN.H / 2 - vv;
        pos[2] = data.heightAt(uu, vv) * data.size + data.size * 0.46;
        fwd[0] = p.du; fwd[1] = -p.dv; fwd[2] = 0;
        writeAnt(arr, base, antTpl, pos, fwd, [0, 0, 1], 0.15, d * 30 + i);
      }
      ants.instanceMatrix.needsUpdate = true;
    }

    // Gentle sway, like the flower's turntable but staying front-facing.
    if (!still && group.current) {
      group.current.rotation.y = -0.42 + Math.sin(t * 0.18) * 0.1;
      group.current.position.y = Math.sin(t * 0.5) * 0.03;
    }
  });

  return (
    <group ref={group} rotation={[-0.14, -0.42, 0]}>
      <instancedMesh ref={meshRef} args={[geometry, material, data.count]} castShadow={!lite} receiveShadow={!lite} frustumCulled={false} />
      <instancedMesh ref={antsRef} args={[antGeometry, antMaterial, antCount * antTpl.count]} castShadow={!lite} frustumCulled={false} />
    </group>
  );
}

function Rig({ still }: { still: boolean }) {
  const get = useThree((s) => s.get);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const pointer = useWindowPointer(!still);
  const eased = useRef({ x: 0, y: 0 });
  const distance = 6.3 * Math.max(1, 1.42 / (width / Math.max(1, height)));

  const place = () => {
    const cam = get().camera;
    cam.position.set(eased.current.x * 0.8, 0.45 - eased.current.y * 0.4, distance);
    cam.lookAt(0, -0.08, 0);
  };
  useLayoutEffect(place);
  useFrame((_, delta) => {
    if (still) return;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 1.6);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    place();
  });
  return null;
}

export default function BrowserScene({ lite, still, active, onReady }: BrowserSceneProps) {
  return (
    <Canvas
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      shadows={lite ? false : "percentage"}
      frameloop={still || !active ? "demand" : "always"}
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0.45, 7.4] }}
      gl={voxelGl}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Rig still={still} />
      {/* Raking key light from the upper left so raised interface elements cast shadows. */}
      <VoxelLights shadows={!lite} shadowBox={[-3.5, 3.5, 2.5, -2.5]} keyPosition={[-5.5, 4.5, 3.5]} ambient={1.2} />
      <Browser lite={lite} still={still} onReady={onReady} />
    </Canvas>
  );
}
