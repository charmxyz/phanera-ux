import { cn } from "@/lib/utils";
import { TOP_ANT, cellsToPath } from "./sprites";

const { w: W, h: H } = TOP_ANT;
const BODY = cellsToPath(TOP_ANT.body);
const STILL = cellsToPath(TOP_ANT.still);
const LEGS_A = cellsToPath(TOP_ANT.legs[0]);
const LEGS_B = cellsToPath(TOP_ANT.legs[1]);

/** The Phanera pixel ant (top-down). Pure SVG, server-renderable. */
export function PixelAnt({ className, walking = false }: { className?: string; walking?: boolean }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn(walking && "ant-walk", className)} fill="currentColor" aria-hidden>
      <path d={BODY} />
      {walking ? (
        <>
          <path className="ant-legs-a" d={LEGS_A} />
          <path className="ant-legs-b" d={LEGS_B} />
        </>
      ) : (
        <path d={STILL} />
      )}
    </svg>
  );
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return Math.abs(h);
}

type AvatarProps = {
  seed: string;
  size?: number;
  /** "active" walks in place; "done" is solid; "failed" turns red; "idle" is dimmed. */
  state?: "idle" | "active" | "done" | "failed";
  className?: string;
};

/**
 * Per-persona ant: same silhouette, but each seed gets its own heading,
 * so a row of personas reads like ants going about different errands.
 */
export function AntAvatar({ seed, size = 40, state = "idle", className }: AvatarProps) {
  const angle = (hash(seed) % 90) - 45;
  const S = Math.max(W, H) + 4;
  return (
    <svg
      viewBox={`0 0 ${S} ${S}`}
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden
      className={cn(
        "shrink-0",
        state === "failed" ? "text-destructive" : "text-foreground",
        state === "idle" && "opacity-70",
        state === "active" && "ant-walk",
        className,
      )}
    >
      <g transform={`rotate(${angle} ${S / 2} ${S / 2}) translate(${(S - W) / 2} ${(S - H) / 2})`}>
        <path d={BODY} />
        {state === "active" ? (
          <>
            <path className="ant-legs-a" d={LEGS_A} />
            <path className="ant-legs-b" d={LEGS_B} />
          </>
        ) : (
          <path d={STILL} />
        )}
      </g>
    </svg>
  );
}
