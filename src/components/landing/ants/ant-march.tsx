"use client";

import { useCallback, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AntScene } from "@/components/ants/ant-scene";
import { SceneBoundary, useInView, useLiteDevice, useReducedMotion, useWebGL } from "@/components/voxel/voxel-stage";
import { cn } from "@/lib/utils";

const MarchScene = dynamic(() => import("./march-scene"), { ssr: false });

/** Columns of white voxel ants marching across the section; 2D pixel ants without WebGL. */
export function AntMarch({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const webgl = useWebGL();
  const still = useReducedMotion();
  const lite = useLiteDevice();
  const active = useInView(ref);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const fallback = <AntScene flower={false} trails={2} every={5} className="opacity-40" />;

  return (
    <div ref={ref} aria-hidden className={cn("absolute inset-0", className)}>
      {webgl && (
        <div className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}>
          <SceneBoundary fallback={fallback}>
            <MarchScene lite={lite} still={still} active={active} onReady={onReady} />
          </SceneBoundary>
        </div>
      )}
      {webgl === false && fallback}
    </div>
  );
}
