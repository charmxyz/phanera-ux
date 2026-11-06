import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { BotIcon, ChevronDownIcon, ChevronLeftIcon, TargetIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { SessionReplay } from "@/components/sessions/session-replay";
import { JourneyGraph } from "@/components/sessions/journey-graph";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { requireSession, signedScreenshotUrls, formatDuration } from "@/lib/dashboard/queries";
import type { Persona, SessionEvaluation } from "@/lib/claude/schemas";
import { pageKey } from "@/components/sessions/journey";

export const metadata: Metadata = { title: "Agent session" };

export default async function SessionPage({ params }: PageProps<"/dashboard/tests/[id]/sessions/[sessionId]">) {
  const { id, sessionId } = await params;
  const { supabase } = await requireSession();
  const { data: session } = await supabase.from("sessions").select("*").eq("id", sessionId).eq("test_id", id).maybeSingle();
  if (!session) notFound();
  const [{ data: persona }, { data: events }, { data: test }] = await Promise.all([
    supabase.from("personas").select("*").eq("id", session.persona_id).single(),
    supabase.from("session_events").select("*").eq("session_id", sessionId).order("step"),
    supabase.from("tests").select("title, goal").eq("id", id).single(),
  ]);
  const urls = await signedScreenshotUrls((events ?? []).map((e) => e.screenshot_path).filter((p): p is string => Boolean(p)));
  const conf = (persona?.configuration ?? {}) as Partial<Persona>;
  const evaluation = session.evaluation as SessionEvaluation | null;
  const active = session.status === "queued" || session.status === "running";
  const pagesVisited = new Set((events ?? []).map((e) => e.url).filter((u): u is string => !!u && !u.startsWith("chrome-error")).map(pageKey)).size;

  return (
    <div className="grid gap-6">
      <AutoRefresh active={active} />
      <PageHeader
        eyebrow={<Link href={`/dashboard/tests/${id}?tab=sessions`} className="inline-flex items-center gap-1 hover:text-foreground"><ChevronLeftIcon className="size-3" />{test?.title}</Link>}
        title={<span className="flex items-center gap-3"><AntAvatar seed={(persona?.name ?? "") + (persona?.role ?? "")} size={32} state={active ? "active" : "done"} />{persona?.name} · <span className="font-normal text-muted-foreground">{persona?.role}</span></span>}
        description={<span className="font-mono text-xs">session {session.id.slice(0, 8)} · {formatDuration(session.duration_ms)} · {session.action_count} actions · {conf.device ?? "desktop"}</span>}
        actions={session.outcome ? <OutcomeLabel outcome={session.outcome} /> : <StatusLabel status={session.status} />}
      />
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
          {session.agent_summary && <AgentReport text={session.agent_summary} />}
        </Card>

        <Card className="gap-0 py-0">
          <div className="grid gap-2 px-5 py-5">
            <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Task</span>
            <p className="leading-relaxed text-pretty">{persona?.goal}</p>
            {session.current_activity && active && <p className="text-primary">{session.current_activity}</p>}
          </div>
          {conf.success_criteria && (
            <div className="mx-5 mb-5 grid gap-1 rounded-lg border border-border bg-muted/40 px-3.5 py-3">
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><TargetIcon className="size-3.5" />Success when</span>
              <p className="leading-relaxed text-pretty">{conf.success_criteria}</p>
            </div>
          )}
          {(
            <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border px-5 py-3 text-xs text-muted-foreground">
              <span className="rounded-md bg-muted px-2 py-0.5">{conf.kind === "ai_agent" ? "AI agent" : "Human persona"}</span>
              <span className="rounded-md bg-muted px-2 py-0.5 capitalize">{conf.device ?? "desktop"}</span>
            </div>
          )}
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
                    <span className={o.is_website_issue ? "rounded-md bg-warning/10 px-1.5 py-0.5 text-warning" : "rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground"}>
                      {o.is_website_issue ? "Website issue" : "Agent / environment"}
                    </span>
                    {o.directly_observed && <span className="rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">Seen in screenshot</span>}
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
            goal={persona?.goal ?? test?.goal ?? ""}
            outcome={session.outcome}
            finalReport={session.agent_summary}
            active={active}
            issues={(evaluation?.observations ?? []).map((o) => ({ step: o.step, issue: o.issue, isWebsiteIssue: o.is_website_issue, directlyObserved: o.directly_observed }))}
            events={(events ?? []).map((e) => ({
              step: e.step, action: e.action, target: e.target, url: e.url, result: e.result,
              reasoning: e.reasoning, observation: e.observation ?? null, error: e.error,
              screenshotUrl: e.screenshot_path ? urls[e.screenshot_path] ?? null : null,
            }))}
          />
        </CardContent>
      </Card>
      <SessionReplay
        startedAt={session.started_at}
        events={(events ?? []).map((e) => ({
          id: e.id, step: e.step, timestamp: e.timestamp, action: e.action, target: e.target, url: e.url,
          result: e.result, reasoning: e.reasoning, error: e.error,
          screenshotUrl: e.screenshot_path ? urls[e.screenshot_path] ?? null : null,
        }))}
      />
    </div>
  );
}

function ReportList({ points }: { points: string[] }) {
  return (
    <ul className="grid gap-2">
      {points.map((pt, i) => (
        <li key={i} className="flex gap-2.5 leading-relaxed">
          <span className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
          <span className="min-w-0 break-words"><Linkified text={pt} /></span>
        </li>
      ))}
    </ul>
  );
}

/** The agent's own words: the first few points, with the rest behind a toggle. */
function AgentReport({ text }: { text: string }) {
  const points = reportPoints(text);
  const head = points.slice(0, 3);
  const rest = points.slice(3);
  return (
    <div className="grid gap-3 border-t border-border bg-muted/40 px-5 py-4">
      <span className="flex items-center gap-2 font-medium"><BotIcon className="size-4 text-muted-foreground" />Agent&apos;s own report</span>
      <ReportList points={head} />
      {rest.length > 0 && (
        <details className="group grid gap-2">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show {rest.length} more</span>
            <span className="hidden group-open:inline">Show less</span>
            <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-2"><ReportList points={rest} /></div>
        </details>
      )}
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

/** Splits the agent's run-on report into readable points (sentence / clause boundaries). */
function reportPoints(text: string): string[] {
  return text
    .split(/(?<=[.;])\s+(?=[A-Z])/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Renders URLs as compact links so long reports stay scannable. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s,;)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a key={i} href={part.replace(/[.]$/, "")} target="_blank" rel="noreferrer noopener" className="font-mono text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground">
            {part.replace(/^https?:\/\/(www\.)?/, "").replace(/[.]$/, "")}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}
