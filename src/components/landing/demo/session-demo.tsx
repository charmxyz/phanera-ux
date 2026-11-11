"use client";

import dynamic from "next/dynamic";
import { AlertTriangleIcon, CheckIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { OutcomeLabel } from "@/components/sessions/status";
import { SessionReplay } from "@/components/sessions/session-replay";
import { FINAL_REPORT, GOAL, ISSUES, JOURNEY_EVENTS, PERSONA, REPLAY_EVENTS, STARTED_AT } from "./shop-session";

// React Flow is heavy and client-only; load it when the section renders.
const JourneyGraph = dynamic(() => import("@/components/sessions/journey-graph").then((m) => m.JourneyGraph), {
  ssr: false,
  loading: () => <Skeleton className="h-[500px] w-full rounded-lg" />,
});

const POINTS = [
  { ok: true, t: "Search found the charger on the first try" },
  { ok: false, t: "“−” at quantity 1 left the cable in the cart at 0 instead of removing it" },
  { ok: false, t: "A second tap set it to −1, and checkout charged $18.00 for a $29.99 charger" },
];

/** Result, persona and journey for one session, using the dashboard's own components. */
export function SessionDemo() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="gap-0 py-0">
          <div className="grid gap-4 px-5 py-5">
            <OutcomeLabel outcome="partial_success" className="text-xl font-semibold tracking-tight [&_svg]:size-5" />
            <p className="text-lg leading-snug font-medium text-pretty">Dana reached checkout, but the order total was $11.99 too low: the cart let the cable&apos;s quantity drop to −1.</p>
            <ul className="grid gap-2">
              {POINTS.map((p) => (
                <li key={p.t} className="flex gap-2.5 text-sm leading-snug">
                  {p.ok ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" /> : <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-warning" />}
                  {p.t}
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-2 border-t border-border sm:grid-cols-4">
            <Stat label="Duration" value="1m 37s" />
            <Stat label="Actions" value="8" />
            <Stat label="Pages visited" value="5" />
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
          <JourneyGraph persona={PERSONA.name} goal={GOAL} outcome="partial_success" finalReport={FINAL_REPORT} active={false} passiveWheel events={JOURNEY_EVENTS} issues={ISSUES} />
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
