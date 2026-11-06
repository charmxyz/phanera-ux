"use client";

import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, ImageOffIcon, AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ReplayEvent = {
  id: string;
  step: number;
  timestamp: string;
  action: string;
  target: string | null;
  url: string | null;
  result: string | null;
  reasoning: string | null;
  error: string | null;
  screenshotUrl: string | null;
};

const ACTION_LABEL: Record<string, string> = {
  open: "Opened page",
  click: "Clicked",
  type: "Typed into",
  select: "Selected",
  scroll_down: "Scrolled down",
  scroll_up: "Scrolled up",
  go_back: "Went back",
  navigate: "Navigated to",
  finish: "Finished",
  give_up: "Gave up",
  error: "Error",
};

/** Step-by-step screenshot replay with an action timeline (PRD §14.4). */
export function SessionReplay({ events, startedAt }: { events: ReplayEvent[]; startedAt: string | null }) {
  const [idx, setIdx] = useState(Math.max(0, events.length - 1));
  const shots = events.filter((e) => e.screenshotUrl);
  const current = events[idx];
  // Show the latest screenshot at or before the selected step.
  const shot = [...events.slice(0, idx + 1)].reverse().find((e) => e.screenshotUrl) ?? shots[0];
  const t0 = startedAt ? new Date(startedAt).getTime() : events[0] ? new Date(events[0].timestamp).getTime() : 0;
  const rel = (ts: string) => {
    const s = Math.max(0, Math.round((new Date(ts).getTime() - t0) / 1000));
    return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  };

  if (events.length === 0) return <p className="text-sm text-muted-foreground">No recorded steps yet.</p>;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="grid content-start gap-3">
        <div className="overflow-hidden rounded-lg border border-border bg-background">
          <div className="flex items-center gap-2 border-b border-border px-3 py-2">
            <div className="flex gap-1">{[0, 1, 2].map((i) => <span key={i} className="size-2 rounded-full bg-border" />)}</div>
            <span className="truncate font-mono text-xs text-muted-foreground">{current?.url ?? ""}</span>
          </div>
          {shot?.screenshotUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs
            <img src={shot.screenshotUrl} alt={`Screenshot after step ${shot.step}`} className="block w-full" />
          ) : (
            <div className="flex aspect-[16/10] items-center justify-center text-sm text-muted-foreground">
              <ImageOffIcon className="mr-2 size-4" /> No screenshot for this step
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setIdx((i) => i - 1)}><ChevronLeftIcon /> Previous</Button>
          <span className="font-mono text-xs text-muted-foreground">Step {current?.step} of {events[events.length - 1]?.step}</span>
          <Button variant="outline" size="sm" disabled={idx >= events.length - 1} onClick={() => setIdx((i) => i + 1)}>Next <ChevronRightIcon /></Button>
        </div>
        {current?.reasoning && (
          <div className="rounded-lg border border-border bg-card p-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">Agent reasoning (step {current.step})</p>
            {current.reasoning}
          </div>
        )}
      </div>
      <ol className="grid max-h-[620px] content-start gap-0.5 overflow-y-auto pr-1" aria-label="Action timeline">
        {events.map((e, i) => (
          <li key={e.id}>
            <button
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "flex w-full gap-3 rounded-md px-2 py-2 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                i === idx ? "bg-card ring-1 ring-foreground/15" : "hover:bg-muted/50",
              )}
            >
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", e.error ? "bg-destructive" : e.action === "finish" ? "bg-success" : e.action === "give_up" ? "bg-warning" : "bg-foreground/60")} />
              <span className="grid min-w-0 gap-0.5 text-sm">
                <span>
                  <span className="font-mono text-xs text-muted-foreground">{rel(e.timestamp)}</span> · {ACTION_LABEL[e.action] ?? e.action}
                  {e.target && <span className="text-muted-foreground"> {e.target}</span>}
                </span>
                {e.url && <span className="truncate font-mono text-xs text-muted-foreground">{e.url}</span>}
                {e.error && (
                  <span className="flex items-start gap-1 text-xs text-destructive"><AlertCircleIcon className="mt-0.5 size-3 shrink-0" />{e.error}</span>
                )}
                {(e.action === "finish" || e.action === "give_up") && e.result && <span className="line-clamp-2 text-xs text-muted-foreground">{e.result}</span>}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
