import { Verdict, type ReportSummary } from "@/components/report/verdict";
import { IssueBoard, type Ticket } from "@/components/report/issue-board";
import { SessionDetail } from "@/components/report/session-detail";
import { SessionSwitcher } from "@/components/report/session-switcher";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import type { FindingRow, PersonaRow, SessionEventRow, SessionRow, TestRow } from "@/types/database";

/**
 * The one-page report: a short summary, the issues as a severity board (tickets open in a
 * side panel with their fix), then every persona's session in one panel.
 * Shared by the dashboard and the public share page.
 */
export function ReportBody({
  test, personas, sessions, findings, eventsBySession, urls, active = false, children,
}: {
  test: TestRow;
  personas: PersonaRow[];
  sessions: SessionRow[];
  findings: FindingRow[];
  eventsBySession: Map<string, SessionEventRow[]>;
  urls: Record<string, string>;
  active?: boolean;
  /** Extra sections appended after Sessions (e.g. Agent readiness on the dashboard). */
  children?: React.ReactNode;
}) {
  const personaById = new Map(personas.map((p) => [p.id, p]));
  const summary = test.summary as ReportSummary | null;
  const tickets = toTickets(findings, sessions, personaById, eventsBySession, urls);
  const bySeverity = (s: string[]) => findings.filter((f) => s.includes(f.severity)).length;

  return (
    <div className="grid">
      {/* ----------------------------------------------------------- Summary */}
      <div className="grid overflow-hidden rounded-2xl border border-border lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        <div className="grid content-start gap-3 p-6">
          {summary ? (
            <>
              <Verdict counts={summary.counts} total={summary.counts.personas || sessions.length} />
              <p className="max-w-prose leading-relaxed text-pretty text-muted-foreground">{summary.conclusion}</p>
            </>
          ) : (
            <>
              <StatusLabel status={test.status} className="text-lg font-medium" />
              <p className="text-muted-foreground">{active ? "The report appears here when the personas finish." : "No report was generated for this test."}</p>
            </>
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
                    <AntAvatar seed={(p?.name ?? "") + (p?.role ?? "")} size={20} state={s.status === "failed" ? "failed" : s.status === "running" ? "active" : "done"} />
                    <span className="font-medium">{p?.name}</span>
                    {s.outcome ? <OutcomeLabel outcome={s.outcome} className="text-xs" /> : <StatusLabel status={s.status} className="text-xs" />}
                  </a>
                );
              })}
            </dd>
          </div>
        </dl>
      </div>

      {/* ------------------------------------------------------------ Issues */}
      <ReportSection id="issues" title="Issues" description="Sorted by urgency. Open a ticket for the evidence and the recommended fix.">
        {tickets.length ? (
          <IssueBoard tickets={tickets} personas={personas.map((p) => ({ name: p.name, role: p.role }))} />
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            {active ? "Issues appear here when the test finishes." : "No website issues were found in these sessions."}
          </p>
        )}
      </ReportSection>

      {/* ---------------------------------------------------------- Sessions */}
      <ReportSection id="sessions" title="Sessions" description="Pick a persona to see what they did, step by step, with screenshots.">
        <SessionSwitcher
          items={sessions.map((s) => {
            const p = personaById.get(s.persona_id);
            return { id: s.id, name: p?.name ?? "Persona", role: p?.role ?? "", status: s.status, outcome: s.outcome };
          })}
          panels={sessions.map((s) => (
            <SessionDetail key={s.id} session={s} persona={personaById.get(s.persona_id) ?? null} events={eventsBySession.get(s.id) ?? []} urls={urls} testGoal={test.goal} />
          ))}
        />
      </ReportSection>

      {children}
    </div>
  );
}

export function ReportSection({ id, title, description, children }: { id: string; title: string; description?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mt-12 grid scroll-mt-20 gap-6 border-t border-border pt-12 sm:mt-16 sm:pt-16">
      <div className="grid gap-1.5">
        <h2 className="text-3xl font-medium tracking-[-0.02em]">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
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

/** Findings → board tickets, each with the first evidence screenshot that exists. */
function toTickets(
  findings: FindingRow[],
  sessions: SessionRow[],
  personaById: Map<string, PersonaRow>,
  eventsBySession: Map<string, SessionEventRow[]>,
  urls: Record<string, string>,
): Ticket[] {
  return findings.map((f) => {
    const evidence = (f.evidence as Ticket["evidence"] | null) ?? [];
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
}
