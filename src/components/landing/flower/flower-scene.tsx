"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { createVoxelMaterials, seededRandom, setVoxelAttributes, voxelUniforms } from "@/components/voxel/voxel-material";
import { VoxelLights, useWindowPointer, voxelGl } from "@/components/voxel/voxel-stage";
import { buildVoxelAnt, hideAnt, writeAnt } from "@/components/landing/ants/voxel-ant";
import { PART, generateVoxelFlower } from "./voxel-flower";
import { COLONY, TINT_GROUPS, antPose, buildColony, colonyTint, type AntPose } from "./colony";

export interface FlowerSceneProps {
  /** Lighter build for phones/tablets: bigger voxels, no shadow map, lower DPR. */
  lite: boolean;
  /** prefers-reduced-motion: render the finished flower once, no animation. */
  still: boolean;
  /** Pause the render loop while the hero is off-screen. */
  active: boolean;
  onReady?: () => void;
}

const ASSEMBLE_SECONDS = 4;
const ASSEMBLE_DELAY = 0.25;

/** The tone the colony leaves on stamens and petals — the palette's zinc-400 (chart-4). */
const DISCOVERY_TINT = "#a1a1aa";
/** Charcoal, not pure black: reads against both white and tinted cubes. */
const ANT_COLOR = "#34343b";

/** Any time past the end of the whole sequence: flower built, ants parked, tint settled. */
const FINISHED_AT = 60;
/** Turntable angle the live sequence ends near — the tinted petals face the viewer. */
const FINISHED_ROTATION = 1.8;

/**
 * The sequence plays once per page load. Remounts (client navigation back to the
 * home page) and scrolling away and back show the finished state instead.
 */
let playedThisSession = false;

/** Petals breathe open and closed with a ripple travelling to the tips; stamens and leaves sway. */
const FLOWER_MOTION = /* glsl */ `
  vec3 radial = normalize(vec3(base.x, 0.0, base.z) + vec3(1e-4, 0.0, 0.0));
  float u = aAnim.y;
  float ph = aAnim.z;
  float t = uTime;
  vec3 m = vec3(0.0);
  if (aPart < 0.5) {
    float w = u * u;
    float breath = 0.6 * sin(t * 0.55 + ph) + 0.4 * sin(t * 0.9 - u * 3.5 + ph);
    m = (radial * 0.075 + vec3(0.0, -0.04, 0.0)) * w * breath;
    m.y += sin(t * 1.15 - u * 5.0 + ph + aAnim.w * 0.5) * 0.012 * w;
  } else if (aPart < 1.5) {
    // Kept tiny: ants stand on the anthers.
    m = vec3(sin(t * 0.7 + ph), 0.0, cos(t * 0.6 + ph)) * 0.006 * u;
  } else if (aPart > 2.5) {
    float w = u * u;
    m = radial * sin(t * 0.45 + ph) * 0.09 * w + vec3(0.0, sin(t * 0.6 + ph) * 0.03 * w, 0.0);
  }
  return m;
`;

function Flower({ lite, still, onReady }: { lite: boolean; still: boolean; onReady?: () => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const antsRef = useRef<THREE.InstancedMesh>(null);
  const spin = useRef<THREE.Group>(null);
  // Own clock: R3F resets state.clock whenever the frameloop pauses/resumes off-screen.
  const finished = still || playedThisSession;
  const time = useRef(finished ? FINISHED_AT : 0);

  const data = useMemo(() => generateVoxelFlower({ size: lite ? 0.06 : 0.04 }), [lite]);

  /* ---- Colony: dark voxel ants that climb to the stamens. */
  const antTpl = useMemo(() => buildVoxelAnt(0.08), []);
  const colony = useMemo(() => buildColony(data, lite ? 6 : 9), [data, lite]);
  const antGeometry = useMemo(() => new THREE.BoxGeometry(antTpl.size * 0.9, antTpl.size * 0.9, antTpl.size * 0.9), [antTpl]);
  const antMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: ANT_COLOR, roughness: 0.6 }), []);
  useEffect(() => () => { antGeometry.dispose(); antMaterial.dispose(); }, [antGeometry, antMaterial]);
  const pose = useMemo<AntPose>(() => ({ visible: false, pos: [0, 0, 0], fwd: [1, 0, 0], up: [0, 1, 0], stride: 0 }), []);

  const { geometry, material, depthMaterial } = useMemo(() => {
    const g = new THREE.BoxGeometry(data.size * 0.9, data.size * 0.9, data.size * 0.9);
    const scatter = new Float32Array(data.count * 3);
    const anim = new Float32Array(data.count * 4);
    const part = new Float32Array(data.count);

    // Growth order (0 → 1): the stem rises from below the fold, leaves unfurl from where
    // they attach, then stamens and petals open from base to tip. A little jitter softens the front.
    const rnd = seededRandom(1337);
    for (let i = 0; i < data.count; i++) {
      const y = data.positions[i * 3 + 1];
      const u = data.along[i];
      let order: number;
      switch (data.part[i]) {
        case PART.stem:
          order = 0.3 * Math.min(1, Math.max(0, (y + 2.8) / 2.75));
          break;
        case PART.leaf:
          order = 0.1 + 0.35 * u;
          break;
        case PART.stamen:
          order = 0.42 + 0.3 * u;
          break;
        default:
          order = 0.38 + 0.6 * u;
      }
      anim[i * 4] = Math.min(1, Math.max(0, order + (rnd() - 0.5) * 0.06));
      anim[i * 4 + 1] = u;
      anim[i * 4 + 2] = data.phase[i];
      anim[i * 4 + 3] = data.seed[i];
      part[i] = data.part[i];
    }
    setVoxelAttributes(g, { scatter, anim, part });
    g.setAttribute("aTint", new THREE.InstancedBufferAttribute(data.tint, 2));
    return {
      geometry: g,
      ...createVoxelMaterials({ key: "flower", motion: FLOWER_MOTION, still, tint: { groups: TINT_GROUPS, color: DISCOVERY_TINT }, entrance: "grow" }),
    };
  }, [data, still]);

  useEffect(() => () => { geometry.dispose(); material.dispose(); depthMaterial.dispose(); }, [geometry, material, depthMaterial]);

  // Final transforms: tiny height, scale and orientation variance per cube, plus baked occlusion as colour.
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    for (let i = 0; i < data.count; i++) {
      const sd = data.seed[i];
      const j = (sd - 0.5) * 2;
      o.position.set(data.positions[i * 3], data.positions[i * 3 + 1] + j * data.size * 0.08, data.positions[i * 3 + 2]);
      o.rotation.set(j * 0.05, ((sd * 7.31) % 1 - 0.5) * 0.1, ((sd * 3.17) % 1 - 0.5) * 0.08);
      o.scale.setScalar(0.9 + 0.1 * ((sd * 5.71) % 1));
      o.updateMatrix();
      mesh.setMatrixAt(i, o.matrix);
      const v = (1 - data.occlusion[i] * 0.36) * (0.95 + 0.05 * ((sd * 11.3) % 1));
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
    const uniforms = voxelUniforms(mesh);
    if (!still) time.current += Math.min(delta, 0.1);
    const t = time.current;
    uniforms.uTime.value = t;
    uniforms.uProgress.value = Math.min(1, Math.max(0, (t - ASSEMBLE_DELAY) / ASSEMBLE_SECONDS));
    if (uniforms.uProgress.value >= 1) playedThisSession = true;
    if (uniforms.uTint) colonyTint(colony, t, uniforms.uTint.value);

    const ants = antsRef.current;
    if (ants) {
      const arr = ants.instanceMatrix.array as Float32Array;
      for (let i = 0; i < colony.ants.length; i++) {
        antPose(colony, i, t, pose);
        if (pose.visible) writeAnt(arr, i * antTpl.count, antTpl, pose.pos, pose.fwd, pose.up, COLONY.scale, pose.stride);
        else hideAnt(arr, i * antTpl.count, antTpl);
      }
      ants.instanceMatrix.needsUpdate = true;
    }

    // Slow turntable rotation; eases in as the flower settles.
    if (!still && spin.current) spin.current.rotation.y += Math.min(delta, 0.05) * (0.06 + 0.06 * uniforms.uProgress.value);
  });

  return (
    <group ref={spin} rotation={[0, finished ? FINISHED_ROTATION : -0.35, 0]}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, data.count]}
        castShadow={!lite}
        receiveShadow={!lite}
        frustumCulled={false}
      />
      <instancedMesh
        ref={antsRef}
        args={[antGeometry, antMaterial, colony.ants.length * antTpl.count]}
        castShadow={!lite}
        frustumCulled={false}
      />
    </group>
  );
}

/* ------------------------------------------------------- camera + parallax */

function Rig({ still }: { still: boolean }) {
  const { camera, size } = useThree();
  const pointer = useWindowPointer(!still);
  const eased = useRef({ x: 0, y: 0 });
  const target = useMemo(() => new THREE.Vector3(0, -0.15, 0), []);

  // Pull back on narrow canvases so the petals never clip.
  const aspect = size.width / Math.max(1, size.height);
  const distance = 6.5 * Math.max(1, 1.05 / aspect);

  useLayoutEffect(() => {
    camera.position.set(eased.current.x * 0.9, 3.6 - eased.current.y * 0.6, distance);
    camera.lookAt(target);
  }, [camera, distance, target]);

  useFrame((_, delta) => {
    if (still) return;
    const k = 1 - Math.exp(-Math.min(delta, 0.1) * 1.6);
    eased.current.x += (pointer.current.x - eased.current.x) * k;
    eased.current.y += (pointer.current.y - eased.current.y) * k;
    camera.position.set(eased.current.x * 0.9, 3.6 - eased.current.y * 0.6, distance);
    camera.lookAt(target);
  });

  return null;
}

/* ------------------------------------------------------------------ canvas */

export default function FlowerScene({ lite, still, active, onReady }: FlowerSceneProps) {
  return (
    <Canvas
      dpr={lite ? [1, 1.5] : [1, 1.75]}
      shadows={lite ? false : "percentage"}
      frameloop={still || !active ? "demand" : "always"}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, 3.6, 6.5] }}
      gl={voxelGl}
      style={{ pointerEvents: "none" }}
      aria-hidden
    >
      <Rig still={still} />
      <VoxelLights shadows={!lite} />
      <Flower lite={lite} still={still} onReady={onReady} />
    </Canvas>
  );
}
