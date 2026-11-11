"use client";

import dynamic from "next/dynamic";
import { CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { OutcomeLabel } from "@/components/sessions/status";
import { SessionReplay } from "@/components/sessions/session-replay";
import { FINAL_REPORT, GOAL, ISSUES, JOURNEY_EVENTS, PERSONA, REPLAY_EVENTS, STARTED_AT } from "./stripe-session";

// React Flow is heavy and client-only; load it when the section renders.
const JourneyGraph = dynamic(() => import("@/components/sessions/journey-graph").then((m) => m.JourneyGraph), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-lg" />,
});

const POINTS = ["Pricing is one click from the homepage", "UK and EU card rates are shown up front", "The rate for cards from outside Europe took three scrolls to find"];

/** Result, persona and journey for one session, using the dashboard's own components. */
export function SessionDemo() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="gap-0 py-0">
          <div className="grid gap-4 px-5 py-5">
            <OutcomeLabel outcome="success" className="text-xl font-semibold tracking-tight [&_svg]:size-5" />
            <p className="text-lg leading-snug font-medium text-pretty">Jordan found every card rate, but the price for customers outside Europe was three screens below the headline numbers.</p>
            <ul className="grid gap-2">
              {POINTS.map((p) => (
                <li key={p} className="flex gap-2.5 text-sm leading-snug"><CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />{p}</li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
            <Stat label="Duration" value="1m 41s" />
            <Stat label="Actions" value="7" />
            <Stat label="Pages visited" value="3" />
            <Stat label="Usability issues" value={String(ISSUES.length)} />
          </dl>
        </Card>
        <Card className="gap-0 py-0">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <AntAvatar seed={PERSONA.name + PERSONA.role} size={32} state="done" />
            <div className="grid">
              <span className="font-medium">{PERSONA.name}</span>
              <span className="text-xs text-muted-foreground">{PERSONA.role} · {PERSONA.device}</span>
            </div>
          </div>
          <dl className="grid gap-4 px-5 py-5">
            <Fact label="Motivation" value={PERSONA.motivation} />
            <Fact label="How they browse" value={PERSONA.behaviour} />
            <Fact label="Feels confident when" value={PERSONA.confident} />
          </dl>
        </Card>
      </div>
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">User journey</CardTitle>
          <p className="text-xs text-muted-foreground">Pages visited, in order. Click a page for detail.</p>
        </CardHeader>
        <CardContent>
          <JourneyGraph persona={PERSONA.name} goal={GOAL} outcome="success" finalReport={FINAL_REPORT} active={false} passiveWheel events={JOURNEY_EVENTS} issues={ISSUES} />
        </CardContent>
      </Card>
    </div>
  );
}

/** The dashboard's step-by-step replay, opened on the first step. */
export function ReplayDemo() {
  return <SessionReplay events={REPLAY_EVENTS} startedAt={STARTED_AT} initialIndex={0} />;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 border-border px-5 py-3 not-last:border-r max-sm:nth-2:border-r-0 max-sm:nth-[-n+2]:border-b">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-mono text-base tabular-nums">{value}</dd>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="leading-relaxed text-pretty">{value}</dd>
    </div>
  );
}
