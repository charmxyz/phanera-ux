import { CheckCircle2Icon, CircleDashedIcon, Loader2Icon, XCircleIcon, AlertTriangleIcon, MinusCircleIcon, BanIcon, HelpCircleIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Outcome } from "@/types/database";

const OUTCOME: Record<Outcome, { label: string; className: string; Icon: typeof CheckCircle2Icon }> = {
  success: { label: "Success", className: "text-success", Icon: CheckCircle2Icon },
  partial_success: { label: "Partial success", className: "text-warning", Icon: AlertTriangleIcon },
  failed: { label: "Failed", className: "text-destructive", Icon: XCircleIcon },
  abandoned: { label: "Abandoned", className: "text-muted-foreground", Icon: MinusCircleIcon },
  blocked: { label: "Blocked", className: "text-destructive", Icon: BanIcon },
  inconclusive: { label: "Inconclusive", className: "text-muted-foreground", Icon: HelpCircleIcon },
};

export function OutcomeLabel({ outcome, className }: { outcome: Outcome; className?: string }) {
  const o = OUTCOME[outcome];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", o.className, className)}>
      <o.Icon className="size-3.5" />
      {o.label}
    </span>
  );
}

const STATUS: Record<string, { label: string; className: string; Icon: typeof CheckCircle2Icon; spin?: boolean }> = {
  queued: { label: "Queued", className: "text-muted-foreground", Icon: CircleDashedIcon },
  running: { label: "Running", className: "text-primary", Icon: Loader2Icon, spin: true },
  evaluating: { label: "Evaluating", className: "text-primary", Icon: Loader2Icon, spin: true },
  fetching: { label: "Fetching website", className: "text-primary", Icon: Loader2Icon, spin: true },
  discovering: { label: "Discovering pages", className: "text-primary", Icon: Loader2Icon, spin: true },
  extracting: { label: "Extracting content", className: "text-primary", Icon: Loader2Icon, spin: true },
  analysing: { label: "Analysing website", className: "text-primary", Icon: Loader2Icon, spin: true },
  completed: { label: "Completed", className: "text-success", Icon: CheckCircle2Icon },
  complete: { label: "Complete", className: "text-success", Icon: CheckCircle2Icon },
  partial: { label: "Partial", className: "text-warning", Icon: AlertTriangleIcon },
  failed: { label: "Failed", className: "text-destructive", Icon: XCircleIcon },
};

export function StatusLabel({ status, className }: { status: string; className?: string }) {
  const s = STATUS[status] ?? STATUS.queued;
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", s.className, className)}>
      <s.Icon className={cn("size-3.5", s.spin && "animate-spin")} />
      {s.label}
    </span>
  );
}

export const ACTIVE_DISCOVERY = ["queued", "fetching", "discovering", "extracting", "analysing"];
export const ACTIVE_TEST = ["queued", "running", "evaluating"];
