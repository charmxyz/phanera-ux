import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { SessionReplay } from "@/components/sessions/session-replay";
import { JourneyGraph } from "@/components/sessions/journey-graph";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { requireSession, signedScreenshotUrls, formatDuration } from "@/lib/dashboard/queries";
import type { Persona, SessionEvaluation } from "@/lib/claude/schemas";

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

  return (
    <div className="grid gap-6">
      <AutoRefresh active={active} />
      <PageHeader
        eyebrow={<Link href={`/dashboard/tests/${id}?tab=sessions`} className="inline-flex items-center gap-1 hover:text-foreground"><ChevronLeftIcon className="size-3" />{test?.title}</Link>}
        title={<span className="flex items-center gap-3"><AntAvatar seed={(persona?.name ?? "") + (persona?.role ?? "")} size={32} state={active ? "active" : "done"} />{persona?.name} · <span className="font-normal text-muted-foreground">{persona?.role}</span></span>}
        description={<span className="font-mono text-xs">session {session.id.slice(0, 8)} · {formatDuration(session.duration_ms)} · {session.action_count} actions · {conf.device ?? "desktop"}</span>}
        actions={session.outcome ? <OutcomeLabel outcome={session.outcome} /> : <StatusLabel status={session.status} />}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader><CardTitle className="text-sm">Task</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>{persona?.goal}</p>
            {conf.success_criteria && <p className="text-muted-foreground">Success when: {conf.success_criteria}</p>}
            {session.current_activity && <p className="text-primary">{session.current_activity}</p>}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader><CardTitle className="text-sm">Final result</CardTitle></CardHeader>
          <CardContent className="grid gap-2 text-sm">
            {evaluation ? <p>{evaluation.rationale}</p> : <p className="text-muted-foreground">{active ? "In progress." : "Not evaluated."}</p>}
            {session.agent_summary && <p className="text-muted-foreground">Agent&apos;s own report: {session.agent_summary}</p>}
            {session.error && <p className="text-destructive">{session.error}</p>}
          </CardContent>
        </Card>
      </div>
      {evaluation?.observations?.length ? (
        <Card size="sm">
          <CardHeader><CardTitle className="text-sm">Observed issues</CardTitle></CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-sm">
              {evaluation.observations.map((o, i) => (
                <li key={i} className="flex gap-3">
                  <span className="w-14 shrink-0 font-mono text-xs text-muted-foreground">{o.step != null ? `step ${o.step}` : "—"}</span>
                  <span>{o.issue} <span className="text-xs text-muted-foreground">({o.is_website_issue ? "website" : "agent/environment"}{o.directly_observed ? ", observed" : ""})</span></span>
                </li>
              ))}
            </ul>
          </CardContent>
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
