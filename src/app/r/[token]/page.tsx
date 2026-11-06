import type { Metadata } from "next";
import { EyeIcon } from "lucide-react";
import { ReportOverview, type ReportSummary } from "@/components/report/overview";
import { FindingsList } from "@/components/report/findings-list";
import { SessionDetail } from "@/components/report/session-detail";
import { ReportNav } from "@/components/report/report-nav";
import { SessionSwitcher } from "@/components/report/session-switcher";
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

/**
 * Public, view-only report on a single page: overview, every finding expanded, and each
 * persona's full session inline. No login; reached only through the owner's share link.
 */
export default async function SharedReportPage({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  const { test, website, personas, sessions, findings } = await getSharedReport(token);
  const { events, urls } = await getSharedEvents(sessions.map((s) => s.id));
  const eventsBySession = new Map<string, SessionEventRow[]>();
  for (const e of events) eventsBySession.set(e.session_id, [...(eventsBySession.get(e.session_id) ?? []), e]);
  const personaById = new Map(personas.map((p) => [p.id, p]));

  return (
    <div className="container-marketing grid gap-6 py-10 sm:py-14">
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

      <ReportNav
        items={[
          { id: "overview", label: "Overview" },
          { id: "findings", label: `Findings${findings.length ? ` (${findings.length})` : ""}` },
          { id: "sessions", label: "Sessions" },
        ]}
      />

      <Section id="overview" title="Overview">
        <ReportOverview
          summary={test.summary as ReportSummary | null}
          sessions={sessions}
          personas={personas}
          findings={findings}
          active={false}
          sessionHref={(sid) => `#session-${sid}`}
          findingsHref="#findings"
        />
      </Section>

      <Section id="findings" title="Findings" count={findings.length} description="Every issue the evaluator could back with evidence, with the suggested fix.">
        <FindingsList findings={findings} sessions={sessions} personas={personas} eventsBySession={eventsBySession} urls={urls} active={false} seed={test.id} expanded />
      </Section>

      <Section id="sessions" title="Sessions" description="What each persona did, step by step, with screenshots.">
        <SessionSwitcher
          items={sessions.map((s) => {
            const p = personaById.get(s.persona_id);
            return { id: s.id, name: p?.name ?? "Persona", role: p?.role ?? "", status: s.status, outcome: s.outcome };
          })}
          panels={sessions.map((s) => (
            <SessionDetail
              key={s.id}
              session={s}
              persona={personaById.get(s.persona_id) ?? null}
              events={eventsBySession.get(s.id) ?? []}
              urls={urls}
              testGoal={test.goal}
            />
          ))}
        />
      </Section>

      <p className="text-xs text-muted-foreground">
        Personas are simulated by AI agents, not real people. Findings are based on recorded browser sessions and screenshots.
      </p>
    </div>
  );
}

function Section({ id, title, count, description, children }: { id: string; title: string; count?: number; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-32 gap-4 pt-6">
      <div className="grid gap-1 border-t border-border pt-8">
        <h2 className="flex items-baseline gap-2 text-2xl font-medium tracking-[-0.02em]">
          {title}
          {count != null && <span className="text-base font-normal text-muted-foreground">{count}</span>}
        </h2>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
