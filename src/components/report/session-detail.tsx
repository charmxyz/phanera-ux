import { TargetIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionReplay } from "@/components/sessions/session-replay";
import { JourneyGraph } from "@/components/sessions/journey-graph";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { pageKey } from "@/components/sessions/journey";
import { AgentReport } from "@/components/sessions/agent-report";
import { formatDuration } from "@/lib/dashboard/format";
import type { Persona, SessionEvaluation } from "@/lib/claude/schemas";
import type { PersonaRow, SessionEventRow, SessionRow } from "@/types/database";

/**
 * Everything about one persona's session: verdict, task, issues, journey graph and replay.
 * Shared by the dashboard and the public share page, so it only takes data (no auth, no links).
 */
export function SessionDetail({
  session, persona, events, urls, testGoal,
}: {
  session: SessionRow;
  persona: PersonaRow | null;
  events: SessionEventRow[];
  /** Signed screenshot URLs keyed by storage path. */
  urls: Record<string, string>;
  testGoal: string;
}) {
  const test = { goal: testGoal };
  const conf = (persona?.configuration ?? {}) as Partial<Persona>;
  const evaluation = session.evaluation as SessionEvaluation | null;
  const active = session.status === "queued" || session.status === "running";
  const pagesVisited = new Set(events.map((e) => e.url).filter((u): u is string => !!u && !u.startsWith("chrome-error")).map(pageKey)).size;

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Result: the verdict first, then why, then the agent's own words. */}
        <Card className="gap-0 py-0">
          <div className="grid gap-3 px-5 py-5">
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Final result</span>
            {session.outcome ? (
              <OutcomeLabel outcome={session.outcome} className="text-xl font-semibold tracking-tight [&_svg]:size-5" />
            ) : (
              <StatusLabel status={session.status} className="text-xl font-semibold tracking-tight [&_svg]:size-5" />
            )}
            {evaluation ? (
              <p className="max-w-prose leading-relaxed text-pretty">{evaluation.rationale}</p>
            ) : (
              <p className="text-muted-foreground">{active ? "In progress." : "Not evaluated."}</p>
            )}
            {session.error && <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-destructive">{session.error}</p>}
          </div>
          <dl className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
            <Stat label="Duration" value={formatDuration(session.duration_ms)} />
            <Stat label="Actions" value={String(session.action_count)} />
            <Stat label="Pages visited" value={String(pagesVisited)} />
            <Stat label="Issues noted" value={String(evaluation?.observations?.length ?? 0)} />
          </dl>
          {session.agent_summary && <AgentReport text={session.agent_summary} className="border-t border-border px-5 py-4" />}
        </Card>

        <Card className="gap-0 py-0">
          <div className="grid gap-2 px-5 py-5">
            <span className="flex items-center gap-1.5 font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase"><TargetIcon className="size-3.5" />Test goal</span>
            <p className="leading-relaxed text-pretty">{test?.goal}</p>
            <p className="text-xs text-muted-foreground">Shared by every persona in this test.</p>
            {session.current_activity && active && <p className="text-primary">{session.current_activity}</p>}
          </div>
          <dl className="grid gap-3 border-t border-border px-5 py-4">
            <PersonaFact label="Motivation" value={persona?.goal} />
            <PersonaFact label="How they browse" value={conf.behaviour} />
            <PersonaFact label="Trusts the answer when" value={conf.success_criteria} />
          </dl>
          <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border px-5 py-3 text-xs text-muted-foreground">
            <span className="rounded-md border border-border px-2 py-0.5">{conf.kind === "ai_agent" ? "AI agent" : "Human persona"}</span>
            <span className="rounded-md border border-border px-2 py-0.5 capitalize">{conf.device ?? "desktop"}</span>
            {conf.patience && <span className="rounded-md border border-border px-2 py-0.5 capitalize">{conf.patience} patience</span>}
          </div>
        </Card>
      </div>
      {evaluation?.observations?.length ? (
        <Card className="gap-0 py-0">
          <div className="border-b border-border px-5 py-4">
            <p className="font-medium">Observed issues</p>
            <p className="text-xs text-muted-foreground">What the evaluator noticed in this session&apos;s steps and screenshots</p>
          </div>
          <ul className="divide-y divide-border">
            {evaluation.observations.map((o, i) => (
              <li key={i} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-3 px-5 py-3">
                <span className="pt-0.5 font-mono text-xs text-muted-foreground">{o.step != null ? `step ${o.step}` : "general"}</span>
                <div className="grid gap-1.5">
                  <p className="leading-snug">{o.issue}</p>
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    <span className={o.is_website_issue ? "rounded-md bg-warning/10 px-1.5 py-0.5 text-warning" : "rounded-md border border-border px-1.5 py-0.5 text-muted-foreground"}>
                      {o.is_website_issue ? "Website issue" : "Agent / environment"}
                    </span>
                    {o.directly_observed && <span className="rounded-md border border-border px-1.5 py-0.5 text-muted-foreground">Seen in screenshot</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">User journey</CardTitle>
          <p className="text-xs text-muted-foreground">Each box is a page the agent visited, with what it observed, what it was thinking, and any issues. Click a page for full detail.</p>
        </CardHeader>
        <CardContent>
          <JourneyGraph
            persona={persona?.name ?? "Agent"}
            goal={test?.goal ?? ""}
            outcome={session.outcome}
            finalReport={session.agent_summary}
            active={active}
            issues={(evaluation?.observations ?? []).map((o) => ({ step: o.step, issue: o.issue, isWebsiteIssue: o.is_website_issue, directlyObserved: o.directly_observed }))}
            events={events.map((e) => ({
              step: e.step, action: e.action, target: e.target, url: e.url, result: e.result,
              reasoning: e.reasoning, observation: e.observation ?? null, error: e.error,
              screenshotUrl: e.screenshot_path ? urls[e.screenshot_path] ?? null : null,
            }))}
          />
        </CardContent>
      </Card>
      <SessionReplay
        startedAt={session.started_at}
        events={events.map((e) => ({
          id: e.id, step: e.step, timestamp: e.timestamp, action: e.action, target: e.target, url: e.url,
          result: e.result, reasoning: e.reasoning, error: e.error,
          screenshotUrl: e.screenshot_path ? urls[e.screenshot_path] ?? null : null,
        }))}
      />
    </>
  );
}

function PersonaFact({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="leading-relaxed text-pretty">{value}</dd>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-border px-5 py-3 not-last:border-r max-sm:nth-2:border-r-0 max-sm:nth-[-n+2]:border-b">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-base tabular-nums">{value}</dd>
    </div>
  );
}
