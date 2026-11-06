import type { Metadata } from "next";
import { EyeIcon } from "lucide-react";
import { Verdict, type ReportSummary } from "@/components/report/overview";
import { IssueBoard, type Ticket } from "@/components/report/issue-board";
import { SessionDetail } from "@/components/report/session-detail";
import { SessionSwitcher } from "@/components/report/session-switcher";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
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
 * Public, view-only report: a short summary, the issues as a severity board (each ticket
 * holds its fix), then every persona's session in one panel. No login needed.
 */
export default async function SharedReportPage({ params }: PageProps<"/r/[token]">) {
  const { token } = await params;
  const { test, website, personas, sessions, findings } = await getSharedReport(token);
  const { events, urls } = await getSharedEvents(sessions.map((s) => s.id));
  const eventsBySession = new Map<string, SessionEventRow[]>();
  for (const e of events) eventsBySession.set(e.session_id, [...(eventsBySession.get(e.session_id) ?? []), e]);
  const personaById = new Map(personas.map((p) => [p.id, p]));
  const summary = test.summary as ReportSummary | null;

  const tickets: Ticket[] = findings.map((f) => {
    const evidence = (f.evidence as Ticket["evidence"] | null) ?? [];
    // The first evidence step that has a screenshot illustrates the ticket.
    let shot: Ticket["shot"] = null;
    for (const ev of evidence) {
      if (ev.step == null || shot) continue;
      const sess = sessions.find((s) => {
        const name = personaById.get(s.persona_id)?.name;
        return name && ev.persona.startsWith(name);
      });
      const e = sess && eventsBySession.get(sess.id)?.find((x) => x.step === ev.step && x.screenshot_path);
      if (e?.screenshot_path && urls[e.screenshot_path]) shot = { url: urls[e.screenshot_path], caption: `${ev.persona} · step ${ev.step}` };
    }
    return {
      id: f.id, severity: f.severity, title: f.title, description: f.description, category: f.category, confidence: f.confidence,
      personas: f.impacted_personas, pageUrl: f.page_url, recommendation: f.recommendation, evidence, shot,
    };
  });
  const bySeverity = (s: string[]) => findings.filter((f) => s.includes(f.severity)).length;

  return (
    <div className="container-marketing pb-16">
      {/* ------------------------------------------------------------ Summary */}
      <header className="grid gap-8 py-12 sm:py-16">
        <div className="grid gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
            <EyeIcon className="size-3" />Shared report · {formatDate(test.created_at).split(",")[0]}
          </span>
          <h1 className="flex min-w-0 items-center gap-3 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="size-8 shrink-0 rounded-md sm:size-10" />
            <span className="truncate">{website.domain}</span>
          </h1>
          <p className="max-w-3xl text-lg leading-snug text-pretty text-muted-foreground">{test.goal}</p>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-border lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
          <div className="grid content-start gap-3 p-6">
            {summary ? (
              <>
                <Verdict counts={summary.counts} total={summary.counts.personas || sessions.length} />
                <p className="max-w-prose leading-relaxed text-pretty text-muted-foreground">{summary.conclusion}</p>
              </>
            ) : (
              <StatusLabel status={test.status} className="text-base" />
            )}
          </div>
          <dl className="grid grid-cols-3 border-t border-border lg:border-t-0 lg:border-l">
            <Count label="High" value={bySeverity(["high", "critical"])} tone="text-destructive" />
            <Count label="Medium" value={bySeverity(["medium"])} tone="text-warning" />
            <Count label="Low" value={bySeverity(["low"])} />
            <div className="col-span-3 grid gap-2 border-t border-border p-5">
              <dt className="text-xs text-muted-foreground">{sessions.length} personas tested</dt>
              <dd className="flex flex-wrap gap-1.5">
                {sessions.map((s) => {
                  const p = personaById.get(s.persona_id);
                  return (
                    <a key={s.id} href={`#session-${s.id}`} className="flex items-center gap-1.5 rounded-full border border-border py-0.5 pr-2.5 pl-0.5 text-xs transition-colors hover:bg-muted">
                      <AntAvatar seed={(p?.name ?? "") + (p?.role ?? "")} size={20} state={s.status === "failed" ? "failed" : "done"} />
                      <span className="font-medium">{p?.name}</span>
                      {s.outcome && <OutcomeLabel outcome={s.outcome} className="text-xs" />}
                    </a>
                  );
                })}
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* ------------------------------------------------------------- Issues */}
      <Section id="issues" title="Issues" description="Sorted by urgency. Open a ticket for the evidence and the recommended fix.">
        {tickets.length ? <IssueBoard tickets={tickets} personas={personas.map((p) => ({ name: p.name, role: p.role }))} /> : <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">No website issues were found in these sessions.</p>}
      </Section>

      {/* ----------------------------------------------------------- Sessions */}
      <Section id="sessions" title="Sessions" description="Pick a persona to see what they did, step by step, with screenshots.">
        <SessionSwitcher
          items={sessions.map((s) => {
            const p = personaById.get(s.persona_id);
            return { id: s.id, name: p?.name ?? "Persona", role: p?.role ?? "", status: s.status, outcome: s.outcome };
          })}
          panels={sessions.map((s) => (
            <SessionDetail key={s.id} session={s} persona={personaById.get(s.persona_id) ?? null} events={eventsBySession.get(s.id) ?? []} urls={urls} testGoal={test.goal} />
          ))}
        />
      </Section>

      <p className="pt-10 text-xs text-muted-foreground">
        Personas are simulated by AI agents, not real people. Findings are based on recorded browser sessions and screenshots.
      </p>
    </div>
  );
}

function Section({ id, title, description, children }: { id: string; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} className="grid scroll-mt-20 gap-6 border-t border-border py-12 sm:py-16">
      <div className="grid gap-1.5">
        <h2 className="text-3xl font-medium tracking-[-0.02em]">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="grid gap-1 border-border p-5 [&:not(:nth-child(3))]:border-r">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={`text-3xl font-semibold tabular-nums ${value ? (tone ?? "") : "text-muted-foreground/50"}`}>{value}</dd>
    </div>
  );
}
