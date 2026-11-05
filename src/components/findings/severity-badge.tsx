import { cn } from "@/lib/utils";

const SEVERITY = {
  critical: "border-destructive/40 bg-destructive/15 text-destructive",
  high: "border-destructive/30 bg-destructive/10 text-red-300",
  medium: "border-warning/30 bg-warning/10 text-warning",
  low: "border-border bg-secondary text-muted-foreground",
} as const;

export function SeverityBadge({ severity, className }: { severity: keyof typeof SEVERITY; className?: string }) {
  return (
    <span className={cn("inline-flex h-5 items-center rounded-md border px-1.5 text-xs font-medium capitalize", SEVERITY[severity], className)}>
      {severity}
    </span>
  );
}

const CONFIDENCE = { confirmed: "Confirmed", likely: "Likely", hypothesis: "Hypothesis" } as const;
export function ConfidenceLabel({ confidence }: { confidence: keyof typeof CONFIDENCE }) {
  return <span className="text-xs text-muted-foreground">{CONFIDENCE[confidence]}</span>;
}
