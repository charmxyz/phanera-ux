import { ExternalLinkIcon } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EmptyState } from "@/components/dashboard/empty-state";
import { SeverityBadge, ConfidenceLabel } from "@/components/findings/severity-badge";
import type { FindingRow, PersonaRow, SessionEventRow, SessionRow } from "@/types/database";

/** Evidence-backed findings, with the screenshot behind each one. Shared by dashboard and share page. */
export function FindingsList({
  findings, sessions, personas, eventsBySession, urls, active, seed,
}: {
  findings: FindingRow[];
  sessions: SessionRow[];
  personas: PersonaRow[];
  eventsBySession: Map<string, SessionEventRow[]>;
  urls: Record<string, string>;
  active: boolean;
  seed: string;
}) {
  const personaById = new Map(personas.map((p) => [p.id, p]));
  return (
    <>
    {findings.length === 0 ? (
      <EmptyState title={active ? "Findings will appear when the test completes" : "No findings"} description={active ? undefined : "The evaluator didn't find website issues supported by evidence in these sessions."} seed={seed} />
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
            <AccordionItem key={f.id} value={f.id} className="rounded-xl border-0 bg-card px-5 ring-1 ring-foreground/10">
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
                        <li key={i} className="rounded-md border border-border px-3 py-2">
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
    </>
  );
}
