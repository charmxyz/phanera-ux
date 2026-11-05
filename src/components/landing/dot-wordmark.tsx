"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Cheap smooth value noise, so dropped dots form soft patches rather than static. */
function noise(x: number, y: number) {
  return (
    Math.sin(x * 0.21 + Math.sin(y * 0.17) * 1.7) * 0.5 +
    Math.sin(y * 0.29 - x * 0.07 + 2.3) * 0.3 +
    Math.sin((x + y) * 0.53 + 1.1) * 0.2
  );
}

function hash(x: number, y: number) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}

/**
 * Giant footer wordmark drawn as a halftone of dots: the word is rendered in the
 * site font offscreen, sampled on a grid, and each filled cell becomes a dot.
 */
export function DotWordmark({ word = "Phanera", className }: { word?: string; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;

    const draw = () => {
      if (cancelled) return;
      const ctx = canvas.getContext("2d");
      const w = canvas.clientWidth;
      if (!ctx || !w) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const style = getComputedStyle(canvas);
      const family = style.fontFamily || "sans-serif";
      const color = style.color;

      // Fit the word to the full width.
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.font = `700 100px ${family}`;
      const m = probe.measureText(word);
      const inkW = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      const fs = (100 * w) / inkW;
      probe.font = `700 ${fs}px ${family}`;
      const fm = probe.measureText(word);
      const ascent = fm.actualBoundingBoxAscent;
      const descent = Math.max(0, fm.actualBoundingBoxDescent);
      const h = Math.ceil(ascent + descent);

      // Rasterise the word offscreen at 1×, then sample it.
      const off = document.createElement("canvas");
      off.width = Math.ceil(w);
      off.height = h;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.font = `700 ${fs}px ${family}`;
      o.textBaseline = "alphabetic";
      o.fillStyle = "#000";
      o.fillText(word, fm.actualBoundingBoxLeft, ascent);
      const px = o.getImageData(0, 0, off.width, off.height).data;

      canvas.style.height = `${h}px`;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;

      // Coarse, legible halftone: ~26 dots up the "P" on desktop, ~16 on phones.
      const step = Math.max(3.5, h / (w < 640 ? 16 : 26));
      const r = step * 0.36;
      for (let gy = 0, y = step / 2; y < h; gy++, y += step) {
        for (let gx = 0, x = step / 2; x < w; gx++, x += step) {
          const a = px[(Math.floor(y) * off.width + Math.floor(x)) * 4 + 3];
          if (a < 128) continue;
          // Knock out soft patches of dots, plus the odd stray, for a hand-set texture.
          const n = noise(gx, gy);
          if (n > 0.55 && hash(gx, gy) < 0.7) continue;
          if (hash(gy, gx) < 0.06) continue;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    // Wait for the web font, or the dots would trace the fallback font.
    document.fonts.ready.then(draw);
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => {
      cancelled = true;
      ro.disconnect();
    };
  }, [word]);

  return (
    <div className={cn("w-full", className)}>
      <span className="sr-only">{word}</span>
      {/* Reserve roughly the final height so the footer doesn't jump when it draws. */}
      <canvas ref={ref} aria-hidden className="block aspect-[4.6/1] w-full font-sans text-foreground" />
    </div>
  );
}
