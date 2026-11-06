import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeftIcon } from "lucide-react";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { SessionDetail } from "@/components/report/session-detail";
import { getSharedEvents, getSharedReport } from "@/lib/share/report";

export async function generateMetadata({ params }: PageProps<"/r/[token]/sessions/[sessionId]">): Promise<Metadata> {
  const { token } = await params;
  const { website } = await getSharedReport(token);
  return { title: `${website.domain} · Persona session` };
}

/** Public, view-only session from a shared report. */
export default async function SharedSessionPage({ params }: PageProps<"/r/[token]/sessions/[sessionId]">) {
  const { token, sessionId } = await params;
  const { test, website, personas, sessions } = await getSharedReport(token);
  // Only sessions belonging to the shared test are reachable.
  const session = sessions.find((s) => s.id === sessionId);
  if (!session) notFound();
  const persona = personas.find((p) => p.id === session.persona_id) ?? null;
  const { events, urls } = await getSharedEvents([session.id]);

  return (
    <div className="container-marketing grid gap-6 py-10 sm:py-14">
      <Link href={`/r/${token}?tab=sessions`} className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeftIcon className="size-4" />{website.domain} report
      </Link>
      <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <AntAvatar seed={(persona?.name ?? "") + (persona?.role ?? "")} size={40} state="done" />
          <div className="min-w-0">
            <h1 className="text-3xl font-medium tracking-[-0.02em]">{persona?.name}</h1>
            <p className="truncate text-muted-foreground">{persona?.role}</p>
          </div>
        </div>
        {session.outcome ? <OutcomeLabel outcome={session.outcome} /> : <StatusLabel status={session.status} />}
      </div>
      <SessionDetail session={session} persona={persona} events={events} urls={urls} testGoal={test.goal} />
    </div>
  );
}
