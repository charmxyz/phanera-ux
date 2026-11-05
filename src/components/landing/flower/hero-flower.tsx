"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SceneBoundary, useInView, useLiteDevice, useReducedMotion, useWebGL } from "@/components/voxel/voxel-stage";
import { FlowerFallback } from "./flower-fallback";
import { cn } from "@/lib/utils";

// three.js only loads in the browser, after the hero copy has painted.
const FlowerScene = dynamic(() => import("./flower-scene"), { ssr: false });

/** Voxel flower hero visual: WebGL when available, static Canvas 2D render otherwise. */
export function HeroFlower({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
  const still = useReducedMotion();
  const lite = useLiteDevice();
  const active = useInView(ref);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const fallback = <FlowerFallback />;

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("size-full transition-opacity duration-1000", webgl === false || ready ? "opacity-100" : "opacity-0", className)}
    >
      {webgl && (
        <SceneBoundary fallback={fallback}>
          <FlowerScene lite={lite} still={still} active={active} onReady={onReady} />
        </SceneBoundary>
      )}
      {webgl === false && fallback}
    </div>
  );
}
