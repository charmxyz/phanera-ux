import Link from "next/link";
import { CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { HeroFlower } from "@/components/landing/flower/hero-flower";
import { SeverityBadge } from "@/components/findings/severity-badge";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import type { FindingRow, PersonaRow, SessionRow } from "@/types/database";

export type ReportSummary = {
  conclusion: string;
  top_fixes: string[];
  readiness: { area: string; status: "good" | "needs_work" | "poor" | "unknown"; interpretation: string }[];
  counts: { personas: number; success: number; partial: number; failed: number; inconclusive: number };
};
type Summary = ReportSummary;

/** Verdict, outcomes, personas, top issues and fixes. Used by the dashboard and public share page. */
export function ReportOverview({
  summary, sessions, personas, findings, active, sessionHref, findingsHref,
}: {
  summary: ReportSummary | null;
  sessions: SessionRow[];
  personas: PersonaRow[];
  findings: FindingRow[];
  active: boolean;
  sessionHref: (sessionId: string) => string;
  findingsHref: string;
}) {
  const personaById = new Map(personas.map((p) => [p.id, p]));
  return (
    <>
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card className="gap-0 py-0">
        <div className="grid gap-5 px-5 py-5">
          {summary ? (
            <>
              <Verdict counts={summary.counts} total={summary.counts.personas || sessions.length} />
              <p className="max-w-prose leading-relaxed text-pretty text-muted-foreground">{summary.conclusion}</p>
              <OutcomeBar counts={summary.counts} total={summary.counts.personas || sessions.length} findings={findings.length} />
            </>
          ) : (
            <p className="text-muted-foreground">{active ? "The report will appear here when evaluation finishes." : "No report was generated for this test."}</p>
          )}
        </div>
        {sessions.length > 0 && (
          <div className="mt-auto grid gap-2 border-t border-border px-5 py-4">
            <span className="text-xs text-muted-foreground">Personas</span>
            <div className="flex flex-wrap gap-2">
              {sessions.map((s) => {
                const p = personaById.get(s.persona_id);
                return (
                  <Link
                    key={s.id}
                    href={sessionHref(s.id)}
                    className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pr-3 pl-1 text-xs transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <AntAvatar seed={(p?.name ?? "") + (p?.role ?? "")} size={22} state={s.status === "completed" ? "done" : s.status === "failed" ? "failed" : s.status === "running" ? "active" : "idle"} />
                    <span className="font-medium">{p?.name}</span>
                    {s.outcome ? <OutcomeLabel outcome={s.outcome} className="text-xs" /> : <StatusLabel status={s.status} className="text-xs" />}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      {/* The colony climbing the flower: same voxel scene as the homepage hero. */}
      <Card className="relative isolate min-h-80 gap-0 py-0">
        <div aria-hidden className="bg-studio absolute inset-0 -z-10" />
        <div className="absolute inset-0 -z-10"><HeroFlower /></div>
        <div className="grid gap-0.5 bg-gradient-to-b from-card via-card/70 to-transparent px-5 pt-5 pb-14">
          <span className="text-xs text-muted-foreground">Personas</span>
          <span className="text-4xl font-semibold tracking-tight">{sessions.length}</span>
          <span className="text-xs text-muted-foreground">{summary ? "Perspectives converged into one report" : "Exploring independently"}</span>
        </div>
      </Card>
    </div>

    {summary && (
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div>
              <p className="font-medium">Most important issues</p>
              <SeverityTally findings={findings} />
            </div>
            {findings.length > 0 && (
              <Link href={findingsHref} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">All findings →</Link>
            )}
          </div>
          {findings.length === 0 ? (
            <p className="px-5 py-4 text-muted-foreground">No website issues were found in these sessions.</p>
          ) : (
            <ul className="divide-y divide-border">
              {findings.slice(0, 5).map((f) => (
                <li key={f.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-start gap-3 px-5 py-3">
                  <SeverityBadge severity={f.severity} className="justify-self-start" />
                  <div className="grid gap-0.5">
                    <p className="leading-snug">{f.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{f.category.replace("_", " ")} · {f.impacted_personas.join(", ")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="gap-0 py-0">
          <div className="border-b border-border px-5 py-4">
            <p className="font-medium">Top recommended fixes</p>
            <p className="text-xs text-muted-foreground">In priority order</p>
          </div>
          <ol className="divide-y divide-border">
            {summary.top_fixes.map((f, i) => (
              <li key={i} className="flex items-start gap-3 px-5 py-3">
                <span className={`mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md font-mono text-xs ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                <span className="leading-snug text-pretty">{f}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    )}
    </>
  );
}

type Counts = Summary["counts"];

function Verdict({ counts, total }: { counts: Counts; total: number }) {
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

/** One stacked bar for how the personas ended up, with the counts as a legend. */
function OutcomeBar({ counts, total, findings }: { counts: Counts; total: number; findings: number }) {
  const parts = [
    { label: "Successful", n: counts.success, bar: "bg-success", text: "text-success" },
    { label: "Partial", n: counts.partial, bar: "bg-warning", text: "text-warning" },
    { label: "Failed / blocked", n: counts.failed, bar: "bg-destructive", text: "text-destructive" },
    { label: "Inconclusive", n: counts.inconclusive, bar: "bg-muted-foreground/40", text: "text-muted-foreground" },
  ];
  return (
    <div className="grid gap-3">
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-muted">
        {parts.filter((p) => p.n > 0).map((p) => (
          <div key={p.label} className={p.bar} style={{ flexGrow: p.n }} />
        ))}
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:flex sm:flex-wrap">
        {parts.filter((p) => p.n > 0 || p.label !== "Inconclusive").map((p) => (
          <div key={p.label} className="grid gap-0.5">
            <dt className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`size-2 rounded-full ${p.bar}`} />{p.label}</dt>
            <dd className={`text-xl font-semibold tabular-nums ${p.n ? p.text : "text-muted-foreground/60"}`}>{p.n}<span className="ml-1 text-xs font-normal text-muted-foreground">/ {total}</span></dd>
          </div>
        ))}
        <div className="grid gap-0.5 sm:ml-auto sm:border-l sm:border-border sm:pl-6">
          <dt className="text-xs text-muted-foreground">Findings</dt>
          <dd className="text-xl font-semibold tabular-nums">{findings}</dd>
        </div>
      </dl>
    </div>
  );
}

function SeverityTally({ findings }: { findings: { severity: "critical" | "high" | "medium" | "low" }[] }) {
  const order = ["critical", "high", "medium", "low"] as const;
  const parts = order.map((s) => [s, findings.filter((f) => f.severity === s).length] as const).filter(([, n]) => n > 0);
  if (!parts.length) return null;
  return <p className="text-xs text-muted-foreground">{parts.map(([s, n]) => `${n} ${s}`).join(" · ")}</p>;
}
