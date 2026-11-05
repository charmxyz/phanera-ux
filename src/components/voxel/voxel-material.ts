import * as THREE from "three";

/**
 * Shared voxel material: a MeshStandardMaterial whose vertex shader moves each
 * instanced cube on the GPU.
 *
 * Per-instance attributes (all optional to fill, but must exist on the geometry):
 *   aScatter  vec3   offset from the final position at the start of assembly
 *   aAnim     vec4   x: assembly delay 0–1, y: "along" 0–1, z: phase, w: seed 0–1
 *   aPart     float  free-form part id, for the motion function
 *
 * Uniforms: uTime (s), uProgress (0 → 1 assembly), uMotion (0 disables idle motion).
 * The caller supplies `motion`: the body of `vec3 vfMotion()`, which can read
 * `base` (the instance's resting position), `aAnim`, `aPart` and `uTime`.
 *
 * Optional tint: cubes can be recoloured per group at runtime. Each cube carries
 * `aTint` = (group + 1, spread) — group 0 means "never tinted" — and the uniform
 * array `uTint[group]` (0 → 1) sweeps the colour across the group along `spread`.
 */

export type VoxelUniforms = Record<"uTime" | "uProgress" | "uMotion", THREE.IUniform<number>>;

const header = (motion: string) => /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uMotion;
attribute vec3 aScatter;
attribute vec4 aAnim;
attribute float aPart;

float vfEase() {
  float p = clamp((uProgress - aAnim.x * 0.6) / 0.4, 0.0, 1.0);
  return 1.0 - pow(1.0 - p, 4.0);
}

mat3 vfRot(float e) {
  vec3 a = normalize(vec3(sin(aAnim.w * 91.3), cos(aAnim.w * 47.1), sin(aAnim.w * 13.7 + 1.0)) + 1e-4);
  float ang = (1.0 - e) * (3.0 + aAnim.w * 6.0);
  float s = sin(ang), c = cos(ang), oc = 1.0 - c;
  return mat3(
    oc * a.x * a.x + c,       oc * a.x * a.y + a.z * s, oc * a.z * a.x - a.y * s,
    oc * a.x * a.y - a.z * s, oc * a.y * a.y + c,       oc * a.y * a.z + a.x * s,
    oc * a.z * a.x + a.y * s, oc * a.y * a.z - a.x * s, oc * a.z * a.z + c
  );
}

vec3 vfMotion() {
  vec3 base = instanceMatrix[3].xyz;
  ${motion}
}
`;

const BEGIN_VERTEX = /* glsl */ `
float vfE = vfEase();
float vfPop = smoothstep(0.0, 0.1, uProgress - aAnim.x * 0.12);
vec3 transformed = vfRot(vfE) * vec3(position) * mix(0.55, 1.0, vfE) * vfPop;
transformed += aScatter * (1.0 - vfE) + vfMotion() * uMotion * vfE;
`;

const TINT_VERTEX = (groups: number) => /* glsl */ `
attribute vec2 aTint;
uniform float uTint[${groups}];
varying float vTint;
`;

const TINT_BEGIN = /* glsl */ `
{
  int g = int(aTint.x + 0.5) - 1;
  float amount = g >= 0 ? uTint[g] : 0.0;
  // A soft front sweeps along the group's spread coordinate as amount goes 0 → 1.
  // (Guarded: with spread 0 the smoothstep would otherwise return 1 at amount 0.)
  vTint = amount > 0.0 ? smoothstep(aTint.y - 0.12, aTint.y, amount * 1.12) : 0.0;
}
`;

/**
 * "grow" entrance: no flight or spin — each cube scales up in place, in the order
 * given by its delay, with a sharp front so the structure reads as growing.
 */
const BEGIN_VERTEX_GROW = /* glsl */ `
float vfP = clamp((uProgress - aAnim.x * 0.8) / 0.2, 0.0, 1.0);
float vfE = 1.0 - pow(1.0 - vfP, 3.0);
vec3 transformed = vec3(position) * vfE;
transformed += aScatter * (1.0 - vfE) + vfMotion() * uMotion * vfE;
`;

export type VoxelEntrance = "scatter" | "grow";

function patch(
  material: THREE.Material,
  uniforms: Record<string, THREE.IUniform>,
  motion: string,
  key: string,
  lit: boolean,
  tintGroups: number,
  entrance: VoxelEntrance,
) {
  const tint = lit && tintGroups > 0;
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", `#include <common>\n${header(motion)}${tint ? TINT_VERTEX(tintGroups) : ""}`)
      .replace("#include <begin_vertex>", (entrance === "grow" ? BEGIN_VERTEX_GROW : BEGIN_VERTEX) + (tint ? TINT_BEGIN : ""));
    if (tint) {
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform vec3 uTintColor;\nvarying float vTint;")
        .replace(
          "#include <color_fragment>",
          // Keep the baked occlusion (grey level of the instance colour) under the tint.
          "#include <color_fragment>\ndiffuseColor.rgb = mix(diffuseColor.rgb, uTintColor * diffuseColor.g, vTint);",
        );
    }
    if (lit && entrance === "scatter") {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <beginnormal_vertex>",
        "vec3 objectNormal = vfRot(vfEase()) * vec3(normal);\n#ifdef USE_TANGENT\nvec3 objectTangent = vec3(tangent.xyz);\n#endif",
      );
    }
  };
  material.customProgramCacheKey = () => `voxel-${key}-${entrance}-${lit ? "lit" : "depth"}-${tint ? tintGroups : 0}`;
}

export function createVoxelMaterials({
  key,
  motion = "return vec3(0.0);",
  still,
  roughness = 0.7,
  tint,
  entrance = "scatter",
}: {
  /** Unique per motion function, so three.js caches the right program. */
  key: string;
  motion?: string;
  still: boolean;
  roughness?: number;
  /** Enable runtime recolouring of `groups` cube groups (needs the `aTint` attribute). */
  tint?: { groups: number; color: THREE.ColorRepresentation };
  /** "scatter": cubes fly in from aScatter, spinning. "grow": cubes scale up in place in delay order. */
  entrance?: VoxelEntrance;
}) {
  const uniforms: VoxelUniforms = {
    uTime: { value: 0 },
    uProgress: { value: still ? 1 : 0 },
    uMotion: { value: still ? 0 : 1 },
  };
  const material = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness, metalness: 0 });
  const groups = tint?.groups ?? 0;
  const litUniforms: Record<string, THREE.IUniform> = { ...uniforms };
  if (tint) {
    litUniforms.uTint = { value: new Float32Array(groups) };
    litUniforms.uTintColor = { value: new THREE.Color(tint.color) };
  }
  material.userData.uniforms = litUniforms; // mutated per frame via the mesh ref
  patch(material, litUniforms, motion, key, true, groups, entrance);
  const depthMaterial = new THREE.MeshDepthMaterial();
  patch(depthMaterial, uniforms, motion, key, false, 0, entrance);
  return { material, depthMaterial };
}

export function voxelUniforms(mesh: THREE.Mesh) {
  return (mesh.material as THREE.Material).userData.uniforms as VoxelUniforms & { uTint?: THREE.IUniform<Float32Array> };
}

/** Adds the per-instance attributes the voxel material expects. */
export function setVoxelAttributes(
  geometry: THREE.BufferGeometry,
  { scatter, anim, part }: { scatter: Float32Array; anim: Float32Array; part: Float32Array },
) {
  geometry.setAttribute("aScatter", new THREE.InstancedBufferAttribute(scatter, 3));
  geometry.setAttribute("aAnim", new THREE.InstancedBufferAttribute(anim, 4));
  geometry.setAttribute("aPart", new THREE.InstancedBufferAttribute(part, 1));
}

/** Deterministic PRNG so scatter clouds are identical on every load. */
export function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
