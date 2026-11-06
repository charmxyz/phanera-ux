import type { Metadata } from "next";
import { EyeIcon } from "lucide-react";
import { ReportBody } from "@/components/report/report-body";
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

  return (
    <div className="container-marketing pb-16">
      <header className="grid gap-4 py-12 sm:py-16">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          <EyeIcon className="size-3" />Shared report · {formatDate(test.created_at).split(",")[0]}
        </span>
        <h1 className="flex min-w-0 items-center gap-3 text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="size-8 shrink-0 rounded-md sm:size-10" />
          <span className="truncate">{website.domain}</span>
        </h1>
        <p className="max-w-3xl text-lg leading-snug text-pretty text-muted-foreground">{test.goal}</p>
      </header>

      <ReportBody test={test} personas={personas} sessions={sessions} findings={findings} eventsBySession={eventsBySession} urls={urls} />

      <p className="pt-10 text-xs text-muted-foreground">
        Personas are simulated by AI agents, not real people. Findings are based on recorded browser sessions and screenshots.
      </p>
    </div>
  );
}
