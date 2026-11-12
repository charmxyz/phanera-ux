import { testModeOf } from "@/lib/tests/mode";
import { cn } from "@/lib/utils";

/**
 * The test's goal under a clear label, so readers know it is what the agents were asked to do
 * (and, for explore runs, that they had no fixed task).
 */
export function TestGoal({ goal, configuration, className }: { goal: string; configuration: unknown; className?: string }) {
  const explore = testModeOf(configuration) === "explore";
  return (
    <span className={cn("grid max-w-3xl gap-1", className)}>
      <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground/80 uppercase">
        Agent goal{explore && " · Free exploration"}
      </span>
      <span className="leading-snug text-pretty text-foreground/85">{goal}</span>
    </span>
  );
}
