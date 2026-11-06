import { CheckIcon, ChevronDownIcon } from "lucide-react";
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

  // Reports before short summaries existed fall back to their (long) rationale, clamped.
  const headline = evaluation?.summary ?? null;
  const points = evaluation?.key_points ?? [];
  const siteIssues = (evaluation?.observations ?? []).filter((o) => o.is_website_issue);
  const runNotes = (evaluation?.observations ?? []).filter((o) => !o.is_website_issue);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        {/* Result: the verdict in one line, the facts behind it, everything else on demand. */}
        <Card className="gap-0 py-0">
          <div className="grid gap-4 px-5 py-5">
            {session.outcome ? (
              <OutcomeLabel outcome={session.outcome} className="text-xl font-semibold tracking-tight [&_svg]:size-5" />
            ) : (
              <StatusLabel status={session.status} className="text-xl font-semibold tracking-tight [&_svg]:size-5" />
            )}
            {headline ? (
              <p className="text-lg leading-snug font-medium text-pretty">{headline}</p>
            ) : evaluation ? (
              <p className="line-clamp-3 leading-relaxed text-muted-foreground">{evaluation.rationale}</p>
            ) : (
              <p className="text-muted-foreground">{active ? session.current_activity ?? "In progress." : "Not evaluated."}</p>
            )}
            {points.length > 0 && (
              <ul className="grid gap-2">
                {points.map((p, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-snug">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{p}
                  </li>
                ))}
              </ul>
            )}
            {session.error && <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{session.error}</p>}
          </div>
          <dl className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
            <Stat label="Duration" value={formatDuration(session.duration_ms)} />
            <Stat label="Actions" value={String(session.action_count)} />
            <Stat label="Pages visited" value={String(pagesVisited)} />
            <Stat label="Usability issues" value={String(siteIssues.length)} />
          </dl>
          {evaluation?.rationale && evaluation.rationale !== headline && (
            <More label="Why this result"><p className="leading-relaxed text-muted-foreground">{evaluation.rationale}</p></More>
          )}
          {session.agent_summary && (
            <More label="Agent's own notes"><AgentReport text={session.agent_summary} heading={false} preview={100} /></More>
          )}
        </Card>

        <Card className="gap-0 py-0">
          <div className="flex flex-wrap gap-1.5 border-b border-border px-5 py-3 text-xs text-muted-foreground">
            <span className="rounded-md border border-border px-2 py-0.5">{conf.kind === "ai_agent" ? "AI assistant" : "Human persona"}</span>
            <span className="rounded-md border border-border px-2 py-0.5 capitalize">{conf.device ?? "desktop"}</span>
            {conf.patience && <span className="rounded-md border border-border px-2 py-0.5 capitalize">{conf.patience} patience</span>}
          </div>
          <dl className="grid gap-4 px-5 py-5">
            <PersonaFact label="Motivation" value={persona?.goal} />
            <PersonaFact label="How they browse" value={conf.behaviour} />
            <PersonaFact label="Trusts the answer when" value={conf.success_criteria} />
          </dl>
        </Card>
      </div>

      {(siteIssues.length > 0 || runNotes.length > 0) && (
        <Card className="gap-0 py-0">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <p className="font-medium">Usability issues in this session</p>
            <span className="text-xs text-muted-foreground">{siteIssues.length} on the website</span>
          </div>
          {siteIssues.length > 0 ? (
            <ul className="divide-y divide-border">
              {siteIssues.map((o, i) => (
                <li key={i} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-start gap-3 px-5 py-3">
                  <span className="pt-0.5 font-mono text-xs text-muted-foreground">{o.step != null ? `step ${o.step}` : "general"}</span>
                  <p className="text-sm leading-snug">
                    {o.issue}
                    {o.directly_observed && <span className="ml-2 rounded-md border border-border px-1.5 py-0.5 text-xs text-muted-foreground">Seen in screenshot</span>}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-3 text-sm text-muted-foreground">No website problems in this session.</p>
          )}
          {runNotes.length > 0 && (
            <More label={`${runNotes.length} note${runNotes.length === 1 ? "" : "s"} about the test setup (not the website)`}>
              <ul className="grid gap-2 text-sm text-muted-foreground">
                {runNotes.map((o, i) => <li key={i}><span className="font-mono text-xs">{o.step != null ? `step ${o.step} · ` : ""}</span>{o.issue}</li>)}
              </ul>
            </More>
          )}
        </Card>
      )}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">User journey</CardTitle>
          <p className="text-xs text-muted-foreground">Pages visited, in order. Click a page for detail.</p>
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

/** Collapsed-by-default extra detail inside a card. */
function More({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-border">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-sm text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
        {label}
        <ChevronDownIcon className="size-4 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-5 pb-4">{children}</div>
    </details>
  );
}
