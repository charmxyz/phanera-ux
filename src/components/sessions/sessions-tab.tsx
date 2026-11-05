"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { SessionReplay, type ReplayEvent } from "./session-replay";
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
              x.id === active ? "border-primary/60 bg-primary/5" : "border-border hover:bg-accent/50",
            )}
          >
            <AntAvatar seed={x.personaName + x.role} size={18} />
            {x.personaName}
          </button>
        ))}
      </div>
      {s && (
        <div className="grid gap-4 rounded-xl border border-border p-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">{s.personaName}</span>
            <span className="text-sm text-muted-foreground">{s.role}</span>
            <span className="ml-auto flex items-center gap-3">
              {s.outcome ? <OutcomeLabel outcome={s.outcome} /> : <StatusLabel status={s.status} />}
              <Link href={`/dashboard/tests/${testId}/sessions/${s.id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
                Open session <ExternalLinkIcon className="size-3" />
              </Link>
            </span>
          </div>
          {s.error && <p className="text-sm text-destructive">{s.error}</p>}
          {s.summary && <p className="text-sm text-muted-foreground"><span className="text-foreground/80">Agent report: </span>{s.summary}</p>}
          <SessionReplay events={s.events} startedAt={s.startedAt} />
        </div>
      )}
    </div>
  );
}
