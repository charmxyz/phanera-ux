"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRightIcon } from "lucide-react";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { SessionReplay, type ReplayEvent } from "./session-replay";
import { AgentReport } from "./agent-report";
import { OutcomeLabel, StatusLabel } from "./status";
import { cn } from "@/lib/utils";
import type { Outcome } from "@/types/database";

export type SessionTabItem = {
  id: string;
  personaName: string;
  role: string;
  status: string;
  outcome: Outcome | null;
  startedAt: string | null;
  error: string | null;
  summary: string | null;
  events: ReplayEvent[];
};

export function SessionsTab({ testId, sessions }: { testId: string; sessions: SessionTabItem[] }) {
  const [active, setActive] = useState(sessions[0]?.id);
  const s = sessions.find((x) => x.id === active);
  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Sessions">
        {sessions.map((x) => (
          <button
            key={x.id}
            role="tab"
            aria-selected={x.id === active}
            onClick={() => setActive(x.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              x.id === active ? "border-foreground/40 bg-card shadow-xs" : "border-border bg-card/60 hover:bg-card",
            )}
          >
            <AntAvatar seed={x.personaName + x.role} size={18} />
            {x.personaName}
          </button>
        ))}
      </div>
      {s && (
        <div className="grid gap-0 overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
            <AntAvatar seed={s.personaName + s.role} size={28} />
            <div className="min-w-0">
              <p className="font-medium">{s.personaName}</p>
              <p className="truncate text-xs text-muted-foreground">{s.role}</p>
            </div>
            <span className="ml-auto flex items-center gap-4">
              {s.outcome ? <OutcomeLabel outcome={s.outcome} /> : <StatusLabel status={s.status} />}
              <Link href={`/dashboard/tests/${testId}/sessions/${s.id}`} className="inline-flex items-center gap-1 rounded-md border border-border px-2.5 py-1 text-xs hover:bg-accent">
                Full session <ArrowRightIcon className="size-3" />
              </Link>
            </span>
          </div>
          {(s.summary || s.error) && (
            <div className="grid gap-3 border-b border-border px-5 py-4">
              {s.error && <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">{s.error}</p>}
              {s.summary && <AgentReport text={s.summary} />}
            </div>
          )}
          <div className="p-5">
            <SessionReplay events={s.events} startedAt={s.startedAt} />
          </div>
        </div>
      )}
    </div>
  );
}
