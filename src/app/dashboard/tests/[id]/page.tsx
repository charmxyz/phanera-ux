import Link from "next/link";
import type { Metadata } from "next";
import { BotIcon, MonitorIcon, SmartphoneIcon, ExternalLinkIcon, InfoIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { AntScene } from "@/components/ants/ant-scene";
import { SeverityBadge, ConfidenceLabel } from "@/components/findings/severity-badge";
import { ACTIVE_TEST, OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { SessionsTab } from "@/components/sessions/sessions-tab";
import { getTestBundle, requireSession, signedScreenshotUrls, formatDate, formatDuration } from "@/lib/dashboard/queries";
import type { Persona } from "@/lib/claude/schemas";
import type { MeasuredReadiness } from "@/lib/discovery/crawl";
import { MeasuredTable } from "@/components/dashboard/measured-table";
import type { SessionEventRow } from "@/types/database";

export const metadata: Metadata = { title: "Test" };

type Summary = {
  conclusion: string;
  top_fixes: string[];
  readiness: { area: string; status: "good" | "needs_work" | "poor" | "unknown"; interpretation: string }[];
  counts: { personas: number; success: number; partial: number; failed: number; inconclusive: number };
};

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
        eyebrow={<Link href={`/dashboard/websites/${website.id}`} className="font-mono hover:text-foreground">{website.domain}</Link>}
        title={test.title}
        description={<span className="font-mono text-xs">{formatDate(test.created_at)}</span>}
        actions={<StatusLabel status={test.status} />}
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
          <div className="grid gap-4 md:grid-cols-[1fr_280px]">
            <Card>
              <CardHeader>
                <CardDescription>Goal</CardDescription>
                <CardTitle className="text-base font-normal">{test.goal}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {summary ? (
                  <>
                    <p className="text-sm leading-relaxed">{summary.conclusion}</p>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Metric label="Successful" value={summary.counts.success} tone="text-success" />
                      <Metric label="Partial" value={summary.counts.partial} tone="text-warning" />
                      <Metric label="Failed / blocked" value={summary.counts.failed} tone="text-destructive" />
                      <Metric label="Findings" value={findings.length} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{active ? "The report will appear here when evaluation finishes." : "No report was generated for this test."}</p>
                )}
              </CardContent>
            </Card>
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 opacity-70">
                {summary ? <AntScene flower={false} trails={Math.min(3, Math.max(1, sessions.length))} every={3} /> : null}
              </div>
              <CardContent className="relative mt-auto grid gap-1">
                <span className="text-xs text-muted-foreground">Personas</span>
                <span className="text-2xl font-semibold">{sessions.length}</span>
                <span className="text-xs text-muted-foreground">{summary ? "Perspectives converged into one report" : "Exploring independently"}</span>
              </CardContent>
            </Card>
          </div>
          {summary && (
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-sm">Most important issues</CardTitle></CardHeader>
                <CardContent className="grid gap-2">
                  {findings.slice(0, 4).map((f) => (
                    <div key={f.id} className="flex items-center gap-2 text-sm"><SeverityBadge severity={f.severity} /><span className="truncate">{f.title}</span></div>
                  ))}
                  {findings.length === 0 && <p className="text-sm text-muted-foreground">No website issues were found in these sessions.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm">Top recommended fixes</CardTitle></CardHeader>
                <CardContent>
                  <ol className="grid list-decimal gap-2 pl-4 text-sm">
                    {summary.top_fixes.map((f, i) => <li key={i}>{f}</li>)}
                  </ol>
                </CardContent>
              </Card>
            </div>
          )}
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
                      <p className="text-sm"><span className="text-muted-foreground">Goal: </span>{p?.goal}</p>
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
            testId={test.id}
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
          {findings.length === 0 ? (
            <EmptyState title={active ? "Findings will appear when the test completes" : "No findings"} description={active ? undefined : "The evaluator didn't find website issues supported by evidence in these sessions."} seed={test.id} />
          ) : (
            <Accordion className="grid gap-2">
              {findings.map((f) => {
                const evidence = (f.evidence as { persona: string; step: number | null; note: string }[]) ?? [];
                const shotEvent = (() => {
                  for (const ev of evidence) {
                    if (ev.step == null) continue;
                    const sess = sessions.find((s) => personaById.get(s.persona_id)?.name && ev.persona.startsWith(personaById.get(s.persona_id)!.name));
                    const e = sess && eventsBySession.get(sess.id)?.find((x) => x.step === ev.step && x.screenshot_path);
                    if (e?.screenshot_path && urls[e.screenshot_path]) return { url: urls[e.screenshot_path], step: ev.step, persona: ev.persona };
                  }
                  return null;
                })();
                return (
                  <AccordionItem key={f.id} value={f.id} className="rounded-xl border border-border px-4">
                    <AccordionTrigger className="gap-3 hover:no-underline">
                      <span className="flex min-w-0 flex-1 items-center gap-3">
                        <SeverityBadge severity={f.severity} />
                        <span className="truncate text-left">{f.title}</span>
                      </span>
                      <span className="hidden text-xs font-normal text-muted-foreground sm:inline">{f.impacted_personas.join(", ")}</span>
                    </AccordionTrigger>
                    <AccordionContent className="grid gap-4 pb-4">
                      <p className="text-sm leading-relaxed">{f.description}</p>
                      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                        <span>Category: <span className="text-foreground/80">{f.category.replace("_", " ")}</span></span>
                        <span>Confidence: <ConfidenceLabel confidence={f.confidence} /></span>
                        <span>Personas: <span className="text-foreground/80">{f.impacted_personas.join(", ")}</span></span>
                        {f.page_url && (
                          <a href={f.page_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-mono hover:text-foreground">
                            {f.page_url.replace(/^https?:\/\//, "")} <ExternalLinkIcon className="size-3" />
                          </a>
                        )}
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid content-start gap-2">
                          <p className="text-xs text-muted-foreground">Evidence</p>
                          <ol className="grid gap-1.5 text-sm">
                            {evidence.map((e, i) => (
                              <li key={i} className="rounded-md border border-border px-2.5 py-1.5">
                                <span className="font-mono text-xs text-muted-foreground">{e.persona}{e.step != null ? ` · step ${e.step}` : ""}</span>
                                <p>{e.note}</p>
                              </li>
                            ))}
                          </ol>
                        </div>
                        {shotEvent && (
                          <figure className="grid gap-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={shotEvent.url} alt={`Evidence screenshot, ${shotEvent.persona} step ${shotEvent.step}`} className="rounded-md border border-border" />
                            <figcaption className="font-mono text-xs text-muted-foreground">{shotEvent.persona} · step {shotEvent.step}</figcaption>
                          </figure>
                        )}
                      </div>
                      <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                        <p className="mb-1 text-xs text-muted-foreground">Suggested fix</p>
                        {f.recommendation}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
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

function Metric({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-xl font-semibold ${tone ?? ""}`}>{value}</p>
    </div>
  );
}

function ReadinessStatus({ status }: { status: "good" | "needs_work" | "poor" | "unknown" }) {
  const map = { good: ["Good", "text-success"], needs_work: ["Needs work", "text-warning"], poor: ["Poor", "text-destructive"], unknown: ["Unknown", "text-muted-foreground"] } as const;
  return <span className={`text-xs ${map[status][1]}`}>{map[status][0]}</span>;
}
