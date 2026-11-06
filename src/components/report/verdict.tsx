import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from "lucide-react";

export type ReportSummary = {
  conclusion: string;
  top_fixes: string[];
  readiness: { area: string; status: "good" | "needs_work" | "poor" | "unknown"; interpretation: string }[];
  counts: { personas: number; success: number; partial: number; failed: number; inconclusive: number };
};
type Summary = ReportSummary;

type Counts = Summary["counts"];

export function Verdict({ counts, total }: { counts: Counts; total: number }) {
  const [text, tone, Icon] =
    total > 0 && counts.success === total
      ? ["Every persona reached the goal", "text-success", CheckCircle2Icon]
      : counts.success > 0
        ? [`${counts.success} of ${total} personas reached the goal`, "text-success", CheckCircle2Icon]
        : counts.partial > 0
          ? [`${counts.partial} of ${total} personas partly reached the goal`, "text-warning", AlertTriangleIcon]
          : ["No persona reached the goal", "text-destructive", XCircleIcon];
  return (
    <div className="flex items-start gap-3">
      <Icon className={`mt-1 size-6 shrink-0 ${tone}`} />
      <h2 className="text-2xl leading-tight font-semibold tracking-tight text-balance">{text}</h2>
    </div>
  );
}
