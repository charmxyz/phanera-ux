import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ChevronLeftIcon } from "lucide-react";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { SessionDetail } from "@/components/report/session-detail";
import { requireSession, signedScreenshotUrls, formatDuration } from "@/lib/dashboard/queries";
import type { Persona } from "@/lib/claude/schemas";

export const metadata: Metadata = { title: "Agent session" };

export default async function SessionPage({ params }: PageProps<"/dashboard/tests/[id]/sessions/[sessionId]">) {
  const { id, sessionId } = await params;
  const { supabase } = await requireSession();
  const { data: session } = await supabase.from("sessions").select("*").eq("id", sessionId).eq("test_id", id).maybeSingle();
  if (!session) notFound();
  const [{ data: persona }, { data: events }, { data: test }] = await Promise.all([
    supabase.from("personas").select("*").eq("id", session.persona_id).single(),
    supabase.from("session_events").select("*").eq("session_id", sessionId).order("step"),
    supabase.from("tests").select("title, goal").eq("id", id).single(),
  ]);
  const urls = await signedScreenshotUrls((events ?? []).map((e) => e.screenshot_path).filter((p): p is string => Boolean(p)));
  const conf = (persona?.configuration ?? {}) as Partial<Persona>;
  const active = session.status === "queued" || session.status === "running";

  return (
    <div className="grid gap-6">
      <AutoRefresh active={active} />
      <PageHeader
        eyebrow={<Link href={`/dashboard/tests/${id}?tab=sessions`} className="inline-flex items-center gap-1 hover:text-foreground"><ChevronLeftIcon className="size-3" />{test?.title}</Link>}
        title={<span className="flex items-center gap-3"><AntAvatar seed={(persona?.name ?? "") + (persona?.role ?? "")} size={32} state={active ? "active" : "done"} />{persona?.name} · <span className="font-normal text-muted-foreground">{persona?.role}</span></span>}
        description={<span className="font-mono text-xs">session {session.id.slice(0, 8)} · {formatDuration(session.duration_ms)} · {session.action_count} actions · {conf.device ?? "desktop"}</span>}
        actions={session.outcome ? <OutcomeLabel outcome={session.outcome} /> : <StatusLabel status={session.status} />}
      />
      <SessionDetail session={session} persona={persona} events={events ?? []} urls={urls} testGoal={test?.goal ?? ""} />
    </div>
  );
}
