"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { SceneBoundary, useInView, useLiteDevice, useReducedMotion, useWebGL } from "@/components/voxel/voxel-stage";
import { cn } from "@/lib/utils";

const FlowScene = dynamic(() => import("./flow-scene"), { ssr: false });

/** Isometric "website → ants → fix list" scene. Without WebGL the captions carry the story. */
export function ColonyFlow({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
  const still = useReducedMotion();
  const lite = useLiteDevice();
  const active = useInView(ref);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  return (
    <div ref={ref} aria-hidden className={cn("relative", className)}>
      {webgl && (
        <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
          <SceneBoundary fallback={null}>
            <FlowScene lite={lite} still={still} active={active} onReady={onReady} />
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
