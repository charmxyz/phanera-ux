import type { Metadata } from "next";
import { EyeIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportOverview, type ReportSummary } from "@/components/report/overview";
import { FindingsList } from "@/components/report/findings-list";
import { SessionsTab } from "@/components/sessions/sessions-tab";
import { StatusLabel } from "@/components/sessions/status";
import { getSharedEvents, getSharedReport } from "@/lib/share/report";
import { formatDate } from "@/lib/dashboard/format";
import type { SessionEventRow } from "@/types/database";

export async function generateMetadata({ params }: PageProps<"/r/[token]">): Promise<Metadata> {
  const { token } = await params;
  const { test, website } = await getSharedReport(token);
  const title = `${website.domain} · Persona test report`;
  return { title, description: test.goal, openGraph: { title, description: test.goal } };
}

/** Public, view-only report. No login; reached only through the owner's share link. */
export default async function SharedReportPage({ params, searchParams }: PageProps<"/r/[token]">) {
  const { token } = await params;
  const sp = await searchParams;
  const { test, website, personas, sessions, findings } = await getSharedReport(token);
  const { events, urls } = await getSharedEvents(sessions.map((s) => s.id));
  const eventsBySession = new Map<string, SessionEventRow[]>();
  for (const e of events) eventsBySession.set(e.session_id, [...(eventsBySession.get(e.session_id) ?? []), e]);
  const personaById = new Map(personas.map((p) => [p.id, p]));
  const tab = typeof sp.tab === "string" ? sp.tab : "overview";

  return (
    <div className="container-marketing grid gap-8 py-10 sm:py-14">
      <div className="grid gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          <EyeIcon className="size-3" />Shared report · {formatDate(test.created_at).split(",")[0]}
        </span>
        <h1 className="flex min-w-0 items-center gap-3 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="size-8 shrink-0 rounded-md sm:size-10" />
          <span className="truncate">{website.domain}</span>
        </h1>
        <p className="max-w-3xl text-lg leading-snug text-pretty text-muted-foreground">{test.goal}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <StatusLabel status={test.status} />
          <span>{sessions.length} AI personas explored this website in real browsers.</span>
        </div>
      </div>

      <Tabs defaultValue={tab}>
        <TabsList className="max-w-full overflow-x-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="findings">Findings{findings.length ? ` (${findings.length})` : ""}</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-4 grid gap-4">
          <ReportOverview
            summary={test.summary as ReportSummary | null}
            sessions={sessions}
            personas={personas}
            findings={findings}
            active={false}
            sessionHref={(sid) => `/r/${token}/sessions/${sid}`}
            findingsHref="?tab=findings"
          />
        </TabsContent>
        <TabsContent value="findings" className="mt-4">
          <FindingsList findings={findings} sessions={sessions} personas={personas} eventsBySession={eventsBySession} urls={urls} active={false} seed={test.id} />
        </TabsContent>
        <TabsContent value="sessions" className="mt-4">
          <SessionsTab
            sessionBase={`/r/${token}/sessions`}
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
      </Tabs>

      <p className="text-xs text-muted-foreground">
        Personas are simulated by AI agents, not real people. Findings are based on recorded browser sessions and screenshots.
      </p>
    </div>
  );
}
