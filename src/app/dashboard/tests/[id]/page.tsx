import Link from "next/link";
import type { Metadata } from "next";
import { BotIcon, MonitorIcon, SmartphoneIcon, InfoIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { AntMarch } from "@/components/landing/ants/ant-march";
import { ACTIVE_TEST, OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { SessionsTab } from "@/components/sessions/sessions-tab";
import { ReportOverview, type ReportSummary } from "@/components/report/overview";
import { FindingsList } from "@/components/report/findings-list";
import { ShareButton } from "@/components/report/share-button";
import { env } from "@/lib/env";
import { getTestBundle, requireSession, signedScreenshotUrls, formatDate, formatDuration } from "@/lib/dashboard/queries";
import type { Persona } from "@/lib/claude/schemas";
import type { MeasuredReadiness } from "@/lib/discovery/crawl";
import { MeasuredTable } from "@/components/dashboard/measured-table";
import type { SessionEventRow } from "@/types/database";

export const metadata: Metadata = { title: "Test" };

type Summary = ReportSummary;

const READINESS_LABEL: Record<string, string> = {
  content_accessibility: "Content accessibility",
  page_discovery: "Page discovery",
  semantic_navigation: "Semantic navigation",
  content_comprehension: "Content comprehension",
  rendering: "Rendering issues",
  structured_information: "Structured information",
};

export default async function TestPage({ params, searchParams }: PageProps<"/dashboard/tests/[id]">) {
  const { id } = await params;
  const sp = await searchParams;
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

  const tab = typeof sp.tab === "string" ? sp.tab : "overview";
  const measured = (website.readiness as { measured?: MeasuredReadiness } | null)?.measured;

  return (
    <div className="grid gap-6">
      <AutoRefresh active={active} />
      <PageHeader
        eyebrow={<span className="font-mono">Test · {formatDate(test.created_at)}</span>}
        title={
          <Link href={`/dashboard/websites/${website.id}`} className="flex min-w-0 items-center gap-2.5 hover:opacity-80">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="size-6 shrink-0 rounded" />
            <span className="truncate">{website.domain}</span>
          </Link>
        }
        description={<span className="block max-w-3xl text-[15px] leading-snug text-pretty text-muted-foreground">{test.goal}</span>}
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
            <CardDescription>{test.status === "evaluating" ? "All sessions recorded. Evaluating evidence and writing findings…" : "Agents are exploring the website in isolated browsers. Statuses update live."}</CardDescription>
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

      <Tabs defaultValue={tab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personas">Personas</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="findings">Findings{findings.length ? ` (${findings.length})` : ""}</TabsTrigger>
          <TabsTrigger value="readiness">Agent Readiness</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------- Overview */}
        <TabsContent value="overview" className="mt-4 grid gap-4">
          <ReportOverview
            summary={summary}
            sessions={sessions}
            personas={personas}
            findings={findings}
            active={active}
            sessionHref={(sid) => `/dashboard/tests/${test.id}/sessions/${sid}`}
            findingsHref="?tab=findings"
          />
        </TabsContent>

        {/* ---------------------------------------------------- Personas */}
        <TabsContent value="personas" className="mt-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {sessions.map((s) => {
              const p = personaById.get(s.persona_id);
              const conf = (p?.configuration ?? {}) as Partial<Persona>;
              return (
                <Link key={s.id} href={`/dashboard/tests/${test.id}/sessions/${s.id}`} className="rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
                  <Card size="sm" className="h-full transition-colors hover:bg-accent/50">
                    <CardContent className="grid gap-3">
                      <div className="flex items-center gap-3">
                        <AntAvatar seed={(p?.name ?? "") + (p?.role ?? "")} size={36} state={s.status === "completed" ? "done" : s.status === "failed" ? "failed" : s.status === "running" ? "active" : "idle"} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{p?.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{p?.role}</p>
                        </div>
                        <span className="text-muted-foreground">{conf.kind === "ai_agent" ? <BotIcon className="size-4" /> : conf.device === "mobile" ? <SmartphoneIcon className="size-4" /> : <MonitorIcon className="size-4" />}</span>
                      </div>
                      <p className="text-sm"><span className="text-muted-foreground">Motivation: </span>{p?.goal}</p>
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        {s.outcome ? <OutcomeLabel outcome={s.outcome} /> : <StatusLabel status={s.status} />}
                        <span className="font-mono">{formatDuration(s.duration_ms)} · {s.action_count} actions · {conf.device ?? "desktop"}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </TabsContent>

        {/* ---------------------------------------------------- Sessions */}
        <TabsContent value="sessions" className="mt-4">
          <SessionsTab
            sessionBase={`/dashboard/tests/${test.id}/sessions`}
            sessions={sessions.map((s) => {
              const p = personaById.get(s.persona_id);
              return {
                id: s.id,
                personaName: p?.name ?? "Persona",
                role: p?.role ?? "",
                status: s.status,
                outcome: s.outcome,
                startedAt: s.started_at,
                error: s.error,
                summary: s.agent_summary,
                events: (eventsBySession.get(s.id) ?? []).map((e) => ({
                  id: e.id, step: e.step, timestamp: e.timestamp, action: e.action, target: e.target, url: e.url,
                  result: e.result, reasoning: e.reasoning, error: e.error,
                  screenshotUrl: e.screenshot_path ? urls[e.screenshot_path] ?? null : null,
                })),
              };
            })}
          />
        </TabsContent>

        {/* ---------------------------------------------------- Findings */}
        <TabsContent value="findings" className="mt-4">
          <FindingsList findings={findings} sessions={sessions} personas={personas} eventsBySession={eventsBySession} urls={urls} active={active} seed={test.id} />
        </TabsContent>

        {/* ---------------------------------------------------- Readiness */}
        <TabsContent value="readiness" className="mt-4 grid gap-4">
          <Alert>
            <InfoIcon />
            <AlertDescription>Measured results come directly from crawling your pages. Interpretation is written by AI from those measurements and the recorded sessions.</AlertDescription>
          </Alert>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Measured</CardTitle><CardDescription>Objective signals from {measured?.pagesAnalysed ?? 0} pages</CardDescription></CardHeader>
              <CardContent>{measured ? <MeasuredTable m={measured} /> : <p className="text-sm text-muted-foreground">No measurements available.</p>}</CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Interpretation</CardTitle><CardDescription>AI assessment based on measurements and sessions</CardDescription></CardHeader>
              <CardContent className="grid gap-3">
                {summary?.readiness?.length ? (
                  summary.readiness.map((r) => (
                    <div key={r.area} className="grid gap-1 border-b border-border pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{READINESS_LABEL[r.area] ?? r.area}</span>
                        <ReadinessStatus status={r.status} />
                      </div>
                      <p className="text-sm text-muted-foreground">{r.interpretation}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Available when the test completes.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ReadinessStatus({ status }: { status: "good" | "needs_work" | "poor" | "unknown" }) {
  const map = { good: ["Good", "text-success"], needs_work: ["Needs work", "text-warning"], poor: ["Poor", "text-destructive"], unknown: ["Unknown", "text-muted-foreground"] } as const;
  return <span className={`text-xs ${map[status][1]}`}>{map[status][0]}</span>;
}
