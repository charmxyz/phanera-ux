"use client";

import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode, type RefObject } from "react";
import * as THREE from "three";
import { Environment, Lightformer } from "@react-three/drei";

/* ------------------------------------------------------------ environment */

let webglSupport: boolean | undefined;
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const c = document.createElement("canvas");
      webglSupport = Boolean(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webglSupport = false;
    }
  }
  return webglSupport;
}

const noopSubscribe = () => () => {};

/** null during SSR/hydration, then whether this browser can run WebGL. */
export function useWebGL() {
  return useSyncExternalStore(noopSubscribe, hasWebGL, () => null);
}

export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
export const useLiteDevice = () => useMedia("(max-width: 767px), (pointer: coarse)");

/** Whether an element is on (or near) the screen; `once` latches the first time it appears. */
export function useInView(ref: RefObject<Element | null>, { once = false, margin = "100px" } = {}) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (once && entry.isIntersecting) io.disconnect();
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, margin]);
  return inView;
}

export class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Live-tracked window pointer in −1…1, for gentle parallax. */
export function useWindowPointer(enabled: boolean) {
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled]);
  return pointer;
}

/* ----------------------------------------------------------------- lights */

export const voxelGl = {
  antialias: true,
  alpha: true,
  powerPreference: "high-performance" as const,
  toneMapping: THREE.NeutralToneMapping,
  toneMappingExposure: 1.3,
};

/** Soft studio lighting shared by every voxel scene. */
export function VoxelLights({
  shadows,
  shadowBox = [-3.2, 3.2, 3, -5],
  keyPosition = [-3.5, 7, 4.5],
  ambient = 1.5,
}: {
  shadows: boolean;
  /** Shadow camera left, right, top, bottom. */
  shadowBox?: [number, number, number, number];
  keyPosition?: [number, number, number];
  /** Sky/ground fill. Lower it to make cube sides read darker. */
  ambient?: number;
}) {
  const [l, r, t, b] = shadowBox;
  return (
    <>
      <hemisphereLight args={[0xffffff, 0xc4c4c8, ambient]} />
      <directionalLight
        position={keyPosition}
        intensity={2.6}
        castShadow={shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
        shadow-camera-left={l}
        shadow-camera-right={r}
        shadow-camera-top={t}
        shadow-camera-bottom={b}
        shadow-camera-near={0.5}
        shadow-camera-far={40}
      />
      <directionalLight position={[5, 2, 3]} intensity={0.45} />
      {/* Soft studio reflections, built locally — no HDR download. */}
      <Environment resolution={64} environmentIntensity={0.35}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 2]} scale={[8, 4, 1]} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, 2]} scale={[4, 6, 1]} rotation-y={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.8} position={[5, 1, -2]} scale={[4, 6, 1]} rotation-y={-Math.PI / 2} />
      </Environment>
    </>
  );
}
