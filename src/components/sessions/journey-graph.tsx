"use client";

import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import { AlertTriangleIcon, EyeIcon, FlagIcon, MessageCircleQuestionIcon, PlayIcon, RotateCcwIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildJourney, type JourneyEvent, type JourneyIssue, type JourneyStep, type PageVisit } from "./journey";

const ACTION_LABEL: Record<string, string> = {
  open: "Opened page",
  click: "Clicked",
  type: "Typed into",
  select: "Selected",
  scroll_down: "Scrolled down",
  scroll_up: "Scrolled up",
  go_back: "Went back",
  navigate: "Navigated to",
  finish: "Task completed",
  give_up: "Task not completed",
  error: "Error",
};

const OUTCOME_LABEL: Record<string, string> = {
  success: "Success",
  partial_success: "Partial success",
  failed: "Failed",
  abandoned: "Abandoned",
  blocked: "Blocked",
  inconclusive: "Inconclusive",
};

const NODE_W = 300;
const GAP_X = 150; // room for the action label on each edge
const HANDLE_TOP = 28; // keep edges level regardless of node height

const actionText = (e: Pick<JourneyEvent, "action" | "target">) =>
  `${ACTION_LABEL[e.action] ?? e.action}${e.target ? ` ${e.target}` : ""}`;
const clip = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

type StartData = { persona: string; goal: string };
type PageData = { visit: PageVisit; selected: boolean };
type EndData = { outcome: string | null; report: string | null; active: boolean; selected: boolean };
type StartNode = Node<StartData, "start">;
type PageNode = Node<PageData, "page">;
type EndNode = Node<EndData, "end">;

const handleStyle = { top: HANDLE_TOP, opacity: 0 };

function StartNodeView({ data }: NodeProps<StartNode>) {
  return (
    <div className="w-[240px] rounded-xl border border-border bg-card p-3 text-xs shadow-sm">
      <div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground"><PlayIcon className="size-3.5 text-primary" /> {data.persona} starts</div>
      <p className="line-clamp-4 text-muted-foreground">{data.goal}</p>
      <Handle type="source" position={Position.Right} style={handleStyle} isConnectable={false} />
    </div>
  );
}

function StepLine({ s }: { s: JourneyStep }) {
  return (
    <li className="grid gap-1 border-t border-border/60 pt-2 first:border-t-0 first:pt-0">
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[10px] text-muted-foreground">#{s.step}</span>
        <span className={cn("font-medium", s.error ? "text-destructive" : "text-foreground")}>{clip(actionText(s), 70)}</span>
      </div>
      {s.observation && (
        <p className="flex gap-1.5 text-muted-foreground"><EyeIcon className="mt-0.5 size-3 shrink-0" /><span className="line-clamp-2">{s.observation}</span></p>
      )}
      {s.reasoning && (
        <p className="flex gap-1.5 text-muted-foreground italic"><MessageCircleQuestionIcon className="mt-0.5 size-3 shrink-0" /><span className="line-clamp-2">{s.reasoning}</span></p>
      )}
      {s.error && <p className="line-clamp-2 text-destructive">{s.error}</p>}
      {s.issues.map((i, k) => (
        <p key={k} className="flex gap-1.5 text-warning"><AlertTriangleIcon className="mt-0.5 size-3 shrink-0" /><span className="line-clamp-2">{i.issue}</span></p>
      ))}
    </li>
  );
}

function PageNodeView({ data }: NodeProps<PageNode>) {
  const { visit, selected } = data;
  return (
    <div
      className={cn(
        "w-[300px] cursor-pointer overflow-hidden rounded-xl border bg-card text-xs shadow-sm transition-colors",
        selected ? "border-primary ring-2 ring-primary/30" : visit.hasError ? "border-destructive/60" : "border-border hover:border-muted-foreground/40",
      )}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} isConnectable={false} />
      <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2">
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[10px]">{visit.index + 1}</span>
        <span className="truncate font-mono text-foreground" title={visit.url}>{visit.label}</span>
        <span className="ml-auto flex shrink-0 items-center gap-1">
          {visit.revisit && <span className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"><RotateCcwIcon className="size-2.5" />revisit</span>}
          {visit.issueCount > 0 && <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] text-warning">{visit.issueCount} issue{visit.issueCount > 1 ? "s" : ""}</span>}
        </span>
      </div>
      {visit.screenshotUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs
        <img src={visit.screenshotUrl} alt={`Screenshot of ${visit.label}`} className="block h-32 w-full object-cover object-top" draggable={false} />
      )}
      <div className="p-3">
        {visit.steps.length ? (
          <ul className="grid gap-2">{visit.steps.slice(0, 4).map((s) => <StepLine key={s.step} s={s} />)}</ul>
        ) : (
          <p className="text-muted-foreground">No actions recorded on this page.</p>
        )}
        {visit.steps.length > 4 && <p className="mt-2 text-muted-foreground">+{visit.steps.length - 4} more · click for details</p>}
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} isConnectable={false} />
    </div>
  );
}

function EndNodeView({ data }: NodeProps<EndNode>) {
  const good = data.outcome === "success";
  const partial = data.outcome === "partial_success";
  return (
    <div
      className={cn(
        "w-[260px] cursor-pointer rounded-xl border bg-card p-3 text-xs shadow-sm",
        data.selected ? "border-primary ring-2 ring-primary/30" : good ? "border-success/50" : partial ? "border-warning/50" : data.active ? "border-border" : "border-destructive/50",
      )}
    >
      <Handle type="target" position={Position.Left} style={handleStyle} isConnectable={false} />
      <div className="mb-1.5 flex items-center gap-1.5 font-medium">
        <FlagIcon className={cn("size-3.5", good ? "text-success" : partial ? "text-warning" : data.active ? "text-muted-foreground" : "text-destructive")} />
        {data.active ? "In progress…" : data.outcome ? OUTCOME_LABEL[data.outcome] ?? data.outcome : "Ended"}
      </div>
      {data.report && <p className="line-clamp-5 text-muted-foreground">{data.report}</p>}
    </div>
  );
}

const nodeTypes = { start: StartNodeView, page: PageNodeView, end: EndNodeView };

type Props = {
  events: JourneyEvent[];
  issues: JourneyIssue[];
  persona: string;
  goal: string;
  outcome: string | null;
  finalReport: string | null;
  active: boolean;
};

/** Page-to-page flow of one persona session (React Flow). Click a page for full detail. */
export function JourneyGraph({ events, issues, persona, goal, outcome, finalReport, active }: Props) {
  const journey = useMemo(() => buildJourney(events, issues), [events, issues]);
  const [selected, setSelected] = useState<string | null>(null);

  const { nodes, edges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const edgeBase = {
      type: "smoothstep" as const,
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      labelBgPadding: [6, 3] as [number, number],
      labelBgBorderRadius: 4,
      labelStyle: { fontSize: 11 },
    };
    nodes.push({ id: "start", type: "start", position: { x: 0, y: 0 }, data: { persona, goal } satisfies StartData, draggable: false });
    let x = 240 + GAP_X;
    let prev = "start";
    journey.visits.forEach((v, i) => {
      nodes.push({ id: v.id, type: "page", position: { x, y: 0 }, data: { visit: v, selected: selected === v.id } satisfies PageData });
      edges.push({
        ...edgeBase,
        id: `${prev}->${v.id}`,
        source: prev,
        target: v.id,
        label: i === 0 ? "Opened" : v.arrivedBy ? clip(actionText(v.arrivedBy), 26) : undefined,
        style: v.arrivedBy?.error ? { stroke: "var(--destructive)" } : undefined,
      });
      prev = v.id;
      x += NODE_W + GAP_X;
    });
    if (journey.ending || !active) {
      nodes.push({
        id: "end",
        type: "end",
        position: { x, y: 0 },
        data: { outcome, report: finalReport ?? journey.ending?.result ?? null, active, selected: selected === "end" } satisfies EndData,
      });
      edges.push({ ...edgeBase, id: `${prev}->end`, source: prev, target: "end", label: journey.ending ? ACTION_LABEL[journey.ending.action] : undefined });
    } else if (edges.length) {
      edges[edges.length - 1].animated = true;
    }
    return { nodes, edges };
  }, [journey, persona, goal, outcome, finalReport, active, selected]);

  const visit = journey.visits.find((v) => v.id === selected);
  // Open on the start of the journey at a readable zoom; long journeys pan to the right.
  const initialView = useMemo(
    () => ({ padding: 0.12, maxZoom: 1, nodes: [{ id: "start" }, ...journey.visits.slice(0, 3).map((v) => ({ id: v.id }))] }),
    [journey],
  );

  if (!events.length) {
    return <p className="text-sm text-muted-foreground">{active ? "The journey will appear here as the agent moves through the website." : "No steps were recorded for this session."}</p>;
  }

  return (
    <div className="grid w-full gap-4">
      {/* Inline height: React Flow measures its container on mount, before stylesheets may have applied. */}
      <div className="w-full overflow-hidden rounded-lg border border-border bg-background" style={{ height: 500 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          colorMode="light"
          fitView
          fitViewOptions={initialView}
          minZoom={0.2}
          maxZoom={1.5}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodeClick={(_, n) => setSelected((cur) => (n.type === "start" || cur === n.id ? null : n.id))}
          proOptions={{ hideAttribution: false }}
          style={{ background: "var(--background)" }}
        >
          <Background gap={16} size={1} color="var(--border)" />
          <Controls showInteractive={false} />
        </ReactFlow>
      </div>

      {visit && <VisitDetail visit={visit} onClose={() => setSelected(null)} />}
      {selected === "end" && (
        <div className="rounded-lg border border-border p-4 text-sm">
          <p className="mb-1 font-medium">{active ? "In progress" : outcome ? OUTCOME_LABEL[outcome] ?? outcome : "Ended"}</p>
          <p className="text-muted-foreground">{finalReport ?? journey.ending?.result ?? "No final report."}</p>
        </div>
      )}
      {journey.generalIssues.length > 0 && !selected && (
        <p className="text-xs text-muted-foreground">{journey.generalIssues.length} issue{journey.generalIssues.length > 1 ? "s" : ""} aren&apos;t tied to a specific step; see Observed issues above.</p>
      )}
    </div>
  );
}

function VisitDetail({ visit, onClose }: { visit: PageVisit; onClose: () => void }) {
  return (
    <div className="grid gap-4 rounded-lg border border-border p-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="grid content-start gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Page {visit.index + 1}{visit.revisit ? " · revisit" : ""}</p>
            <a href={visit.url} target="_blank" rel="noreferrer noopener" className="block truncate font-mono text-sm hover:underline">{visit.url || visit.label}</a>
          </div>
          <button type="button" onClick={onClose} className="shrink-0 text-xs text-muted-foreground hover:text-foreground">Close</button>
        </div>
        {visit.arrivedBy && <p className="text-xs text-muted-foreground">Arrived by: {actionText(visit.arrivedBy)} (step {visit.arrivedBy.step})</p>}
        {visit.screenshotUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URLs
          <img src={visit.screenshotUrl} alt={`Screenshot of ${visit.label}`} className="w-full rounded-md border border-border" />
        ) : (
          <p className="text-xs text-muted-foreground">No screenshot for this page.</p>
        )}
      </div>
      <ol className="grid content-start gap-3 text-sm">
        {visit.steps.map((s) => (
          <li key={s.step} className="grid gap-1.5 rounded-md bg-muted/40 p-3">
            <p className="flex items-baseline gap-2">
              <span className="font-mono text-xs text-muted-foreground">#{s.step}</span>
              <span className={cn("font-medium", s.error && "text-destructive")}>{actionText(s)}</span>
            </p>
            {s.observation && <p className="flex gap-2 text-muted-foreground"><EyeIcon className="mt-0.5 size-3.5 shrink-0" /><span><span className="text-foreground">Observed:</span> {s.observation}</span></p>}
            {s.reasoning && <p className="flex gap-2 text-muted-foreground"><MessageCircleQuestionIcon className="mt-0.5 size-3.5 shrink-0" /><span><span className="text-foreground">Thinking:</span> <em>{s.reasoning}</em></span></p>}
            {s.error && <p className="text-destructive">{s.error}</p>}
            {s.issues.map((i, k) => (
              <p key={k} className="flex gap-2 text-warning">
                <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
                <span>{i.issue} <span className="text-xs text-muted-foreground">({i.isWebsiteIssue ? "website" : "agent/environment"}{i.directlyObserved ? ", observed" : ""})</span></span>
              </p>
            ))}
          </li>
        ))}
        {!visit.steps.length && <li className="text-muted-foreground">The agent arrived here but took no further actions.</li>}
      </ol>
    </div>
  );
}
