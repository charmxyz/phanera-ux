import Link from "next/link";
import type { Metadata } from "next";
import { BotIcon, MonitorIcon, SmartphoneIcon, ExternalLinkIcon, InfoIcon, CheckCircle2Icon, AlertTriangleIcon, XCircleIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { EmptyState } from "@/components/dashboard/empty-state";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { HeroFlower } from "@/components/landing/flower/hero-flower";
import { AntMarch } from "@/components/landing/ants/ant-march";
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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <Card className="gap-0 py-0">
              <div className="grid gap-1.5 border-b border-border px-5 py-4">
                <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Goal</span>
                <p className="text-[15px] leading-snug text-pretty">{test.goal}</p>
              </div>
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
                <div className="mt-auto grid gap-2 border-t border-border bg-muted/40 px-5 py-4">
                  <span className="text-xs text-muted-foreground">Personas</span>
                  <div className="flex flex-wrap gap-2">
                    {sessions.map((s) => {
                      const p = personaById.get(s.persona_id);
                      return (
                        <Link
                          key={s.id}
                          href={`/dashboard/tests/${test.id}/sessions/${s.id}`}
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
                    <Link href="?tab=findings" className="shrink-0 text-xs text-muted-foreground hover:text-foreground">All findings →</Link>
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

function ReadinessStatus({ status }: { status: "good" | "needs_work" | "poor" | "unknown" }) {
  const map = { good: ["Good", "text-success"], needs_work: ["Needs work", "text-warning"], poor: ["Poor", "text-destructive"], unknown: ["Unknown", "text-muted-foreground"] } as const;
  return <span className={`text-xs ${map[status][1]}`}>{map[status][0]}</span>;
}
