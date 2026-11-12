import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { AntMarch } from "@/components/landing/ants/ant-march";
import { ACTIVE_TEST, StatusLabel } from "@/components/sessions/status";
import type { ReportSummary } from "@/components/report/verdict";
import { ReportBody, ReportSection } from "@/components/report/report-body";
import { ShareButton } from "@/components/report/share-button";
import { TestGoal } from "@/components/report/test-goal";
import { StopTestButton } from "@/components/dashboard/stop-test-button";
import { STOP_GRACE_MS } from "@/lib/agents/stop";
import { env } from "@/lib/env";
import { getTestBundle, requireSession, signedScreenshotUrls, formatDate } from "@/lib/dashboard/queries";
import type { MeasuredReadiness } from "@/lib/discovery/crawl";
import { MeasuredTable } from "@/components/dashboard/measured-table";
import type { SessionEventRow } from "@/types/database";

export const metadata: Metadata = { title: "Test" };

type Summary = ReportSummary;

const READINESS_LABEL: Record<string, string> = {
  content_accessibility: "Content accessibility",
  page_discovery: "Page findability",
  semantic_navigation: "Semantic navigation",
  content_comprehension: "Content comprehension",
  rendering: "Rendering issues",
  structured_information: "Structured information",
};

export default async function TestPage({ params }: PageProps<"/dashboard/tests/[id]">) {
  const { id } = await params;
  const { test, website, personas, sessions, findings } = await getTestBundle(id);
  const { supabase } = await requireSession();
  const active = ACTIVE_TEST.includes(test.status);
  const summary = test.summary as Summary | null;
  const cfg = test.configuration as { maxActionsPerPersona?: number };
  const maxActions = cfg.maxActionsPerPersona ?? 8;
  const doneCount = sessions.filter((s) => s.status === "completed" || s.status === "failed").length;
  const personaById = new Map(personas.map((p) => [p.id, p]));

  const { data: events } = sessions.length
    ? await supabase.from("session_events").select("*").in("session_id", sessions.map((s) => s.id)).order("step")
    : { data: [] as SessionEventRow[] };
  const urls = await signedScreenshotUrls((events ?? []).map((e) => e.screenshot_path).filter((p): p is string => Boolean(p)));
  const eventsBySession = new Map<string, SessionEventRow[]>();
  for (const e of events ?? []) eventsBySession.set(e.session_id, [...(eventsBySession.get(e.session_id) ?? []), e]);

  const measured = (website.readiness as { measured?: MeasuredReadiness } | null)?.measured;

  return (
    <div className="grid gap-6">
      <AutoRefresh active={active} />
      <PageHeader
        eyebrow={<span className="font-mono">Usability test · {formatDate(test.created_at)}</span>}
        title={
          <Link href={`/dashboard/websites/${website.id}`} className="flex min-w-0 items-center gap-2.5 hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="size-6 shrink-0 rounded" />
            <span className="truncate">{website.domain}</span>
          </Link>
        }
        description={<TestGoal goal={test.goal} configuration={test.configuration} className="mt-1 text-[15px]" />}
        actions={
          <span className="flex items-center gap-3">
            <StatusLabel status={test.status} />
            <ShareButton testId={test.id} initialUrl={test.share_token ? `${env.appUrl()}/r/${test.share_token}` : null} finished={!active} />
          </span>
        }
      />

      {test.error && (
        <Alert variant={test.status === "failed" ? "destructive" : "default"}>
          <AlertTitle>{test.status === "failed" ? "This test could not complete" : "Some results are missing"}</AlertTitle>
          <AlertDescription>
            {test.error}
            {test.status === "failed" && " Any recorded evidence is preserved below. Failed runs caused by our environment don't count against your usage."}
          </AlertDescription>
        </Alert>
      )}

      {active && (
        <Card>
          <CardHeader>
            <CardTitle>{doneCount} of {sessions.length} personas completed</CardTitle>
            <CardDescription>
              {test.cancel_requested_at
                ? "Stopping… unfinished personas are being stopped, and the report is written from every step they recorded."
                : test.status === "evaluating"
                  ? "All sessions recorded. Generating research insights…"
                  : "Agents are exploring the website in isolated browsers. Statuses update live."}
            </CardDescription>
            <CardAction>
              <StopTestButton testId={test.id} requestedAt={test.cancel_requested_at} graceMs={STOP_GRACE_MS} status={test.status} />
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {/* The colony at work: same voxel ants as the homepage CTA (2D pixel ants without WebGL). */}
            <div aria-hidden className="bg-studio relative isolate h-40 overflow-hidden rounded-lg border border-border sm:h-48">
              <AntMarch className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" />
            </div>
            <Progress value={sessions.length ? (doneCount / sessions.length) * 100 : 0} className="h-1.5" />
            <ul className="grid gap-2">
              {sessions.map((s) => {
                const p = personaById.get(s.persona_id);
                return (
                  <li key={s.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <AntAvatar seed={(p?.name ?? "") + (p?.role ?? "")} size={28} state={s.status === "running" ? "active" : s.status === "completed" ? "done" : s.status === "failed" ? "failed" : "idle"} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p?.name} <span className="font-normal text-muted-foreground">· {p?.role}</span></p>
                      <p className="truncate text-xs text-muted-foreground">{s.current_activity ?? (s.status === "queued" ? "Waiting for a browser" : s.error ?? "")}</p>
                    </div>
                    <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{s.action_count}/{maxActions}</span>
                    <StatusLabel status={s.status} className="text-xs" />
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      )}

      <ReportBody test={test} personas={personas} sessions={sessions} findings={findings} eventsBySession={eventsBySession} urls={urls} active={active}>
        <ReportSection id="readiness" title="AI accessibility" description="How easily AI assistants can find and understand this website. Measured from your pages; interpreted by AI.">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="gap-0 py-0">
              <div className="border-b border-border px-5 py-4">
                <p className="font-medium">Measured</p>
                <p className="text-xs text-muted-foreground">Objective signals from {measured?.pagesAnalysed ?? 0} pages</p>
              </div>
              <div className="px-5 py-4">{measured ? <MeasuredTable m={measured} /> : <p className="text-sm text-muted-foreground">No measurements available.</p>}</div>
            </Card>
            <Card className="gap-0 py-0">
              <div className="border-b border-border px-5 py-4">
                <p className="font-medium">Interpretation</p>
                <p className="text-xs text-muted-foreground">AI assessment of the measurements and sessions</p>
              </div>
              {summary?.readiness?.length ? (
                <ul className="divide-y divide-border">
                  {summary.readiness.map((r) => (
                    <li key={r.area} className="grid gap-1 px-5 py-3">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium">{READINESS_LABEL[r.area] ?? r.area}</span>
                        <ReadinessStatus status={r.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{r.interpretation}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-muted-foreground">Available when the test completes.</p>
              )}
            </Card>
          </div>
        </ReportSection>
      </ReportBody>
    </div>
  );
}

function ReadinessStatus({ status }: { status: "good" | "needs_work" | "poor" | "unknown" }) {
  const map = { good: ["Good", "text-success"], needs_work: ["Needs work", "text-warning"], poor: ["Poor", "text-destructive"], unknown: ["Unknown", "text-muted-foreground"] } as const;
  return <span className={`text-xs ${map[status][1]}`}>{map[status][0]}</span>;
}
