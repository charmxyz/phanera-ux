"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRightIcon, BotIcon, CheckIcon, ClipboardCheckIcon, CompassIcon, GlobeIcon, HistoryIcon, LayoutDashboardIcon,
  Loader2Icon, MonitorIcon, PencilIcon, PlusIcon, RefreshCwIcon, SettingsIcon, ShieldCheckIcon, SmartphoneIcon,
  TargetIcon, Trash2Icon, UsersIcon, CheckCircle2Icon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AntAvatar, PixelAnt } from "@/components/ants/pixel-ant";
import { AntMarch } from "@/components/landing/ants/ant-march";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import type { Outcome } from "@/types/database";
import { cn } from "@/lib/utils";

/**
 * A scripted, auto-playing replay of the real dashboard: same UI components and classes as
 * /dashboard/new and /dashboard/tests/[id], driven by a clock instead of a server.
 * Everything is derived from `t` (ms since the loop started), so any frame can be rendered.
 */

/* ------------------------------------------------------------------ Script */
const DOMAIN = "stripe.com";
const TYPED = "stripe.com";
const GOAL_INDEX = 0;
const MAX_ACTIONS = 20;

const T = {
  typeStart: 900,
  typeEvery: 85,
  clickAnalyse: 2600,
  discovery: 3100,
  wizard: 7800,
  clickMode: 9300,
  clickGoal: 10500,
  scrollPersonas: 11300,
  clickPersona: 12800,
  scrollReview: 13700,
  clickStart: 15000,
  run: 15600,
  report: 28200,
  end: 35000,
};

const STAGES = [
  { at: 0, label: "Queued" },
  { at: 400, label: "Fetching website" },
  { at: 1200, label: "Mapping pages" },
  { at: 2000, label: "Extracting content" },
  { at: 3600, label: "Analysing website" },
];
const PAGES = 48;

const GOALS = [
  "Can a small online store owner find out what a card payment will cost them?",
  "Can a developer find how to accept their first payment in the docs?",
  "Can a visitor tell which product they need to charge for subscriptions?",
];

type DemoPersona = { name: string; role: string; device: "desktop" | "mobile"; ai?: boolean; goal: string; behaviour: string };
const PERSONAS: DemoPersona[] = [
  { name: "Jordan", role: "Small business owner", device: "desktop", goal: "Not losing sales to fees they didn't see coming.", behaviour: "Skims headings, then reads pricing closely." },
  { name: "Priya", role: "Engineering lead", device: "desktop", goal: "Keeping the integration simple enough to own long term.", behaviour: "Goes straight to the docs and API reference." },
  { name: "Atlas", role: "AI research assistant", device: "desktop", ai: true, goal: "Giving its user an answer they can rely on.", behaviour: "Reads page structure and text, not visuals." },
  { name: "Marco", role: "Finance manager", device: "mobile", goal: "Knowing exactly what each payment will cost the business.", behaviour: "Reads the fine print on a phone between meetings." },
];
const PRESELECTED = 3; // the 4th is ticked by the cursor

/** Per-persona live activity, relative to T.run. Mirrors the strings the agent writes to sessions.current_activity. */
type Beat = { at: number; text: string; actions: number; status?: "queued" | "running" | "completed"; outcome?: Outcome };
const RUN: Beat[][] = [
  [
    { at: 0, text: "Starting browser", actions: 0, status: "running" },
    { at: 800, text: "Opening https://stripe.com", actions: 0 },
    { at: 2000, text: "Reading the page", actions: 0 },
    { at: 3200, text: "Opening Pricing from the main navigation", actions: 1 },
    { at: 4600, text: "Scrolling for the rate on cards from outside Europe", actions: 4 },
    { at: 6400, text: "Checking whether other payment methods cost extra", actions: 5 },
    { at: 7600, text: "Heading back to the pricing table", actions: 6 },
    { at: 8400, text: "Evaluating session", actions: 7 },
    { at: 9200, text: "", actions: 7, status: "completed", outcome: "success" },
  ],
  [
    { at: 0, text: "Starting browser", actions: 0, status: "running" },
    { at: 1000, text: "Opening https://stripe.com", actions: 0 },
    { at: 2400, text: "Reading the page", actions: 0 },
    { at: 3900, text: "Opening Docs to look for fees in the API reference", actions: 1 },
    { at: 5700, text: "Searching the docs for “pricing”", actions: 2 },
    { at: 7600, text: "Following a link back to /pricing", actions: 3 },
    { at: 9300, text: "Evaluating session", actions: 5 },
    { at: 10100, text: "", actions: 5, status: "completed", outcome: "success" },
  ],
  [
    { at: 0, text: "Starting browser", actions: 0, status: "running" },
    { at: 700, text: "Opening https://stripe.com", actions: 0 },
    { at: 1600, text: "Reading the page", actions: 0 },
    { at: 2800, text: "Reading the pricing page's headings and text", actions: 1 },
    { at: 4400, text: "Extracting fees for cards, wallets and payouts", actions: 2 },
    { at: 6000, text: "Evaluating session", actions: 3 },
    { at: 6800, text: "", actions: 3, status: "completed", outcome: "success" },
  ],
  [
    { at: 0, text: "Waiting for a browser", actions: 0, status: "queued" },
    { at: 1500, text: "Starting browser", actions: 0, status: "running" },
    { at: 2400, text: "Opening https://stripe.com", actions: 0 },
    { at: 3800, text: "Reading the page", actions: 0 },
    { at: 5400, text: "Opening the mobile menu to find Pricing", actions: 2 },
    { at: 7000, text: "Scrolling the pricing page for the full fee breakdown", actions: 4 },
    { at: 8800, text: "Looking for a way to estimate the total per payment", actions: 6 },
    { at: 9900, text: "Evaluating session", actions: 7 },
    { at: 10600, text: "", actions: 7, status: "completed", outcome: "partial_success" },
  ],
];
const RUN_DONE = 10600;

const FINDINGS = [
  { sev: "High", tone: "bg-destructive", t: "The rate for cards from outside Europe is three screens down", p: ["Jordan", "Marco"] },
  { sev: "Medium", tone: "bg-warning", t: "“See more payment methods” leads to a page with no prices", p: ["Jordan"] },
  { sev: "Medium", tone: "bg-warning", t: "Docs search doesn't surface pricing", p: ["Priya"] },
  { sev: "Low", tone: "bg-muted-foreground/50", t: "Fees aren't marked up as structured data", p: ["Atlas"] },
];

/** Where the cursor heads, and when it clicks. Targets are `data-demo` ids measured live. */
const CURSOR: { at: number; target: string }[] = [
  { at: 300, target: "url" },
  { at: 2000, target: "analyse" },
  { at: 3400, target: "rest-discovery" },
  { at: 8500, target: "mode-goal" },
  { at: 9800, target: "goal" },
  { at: 11900, target: "persona-check" },
  { at: 14200, target: "start" },
  { at: 15800, target: "rest-run" },
  { at: T.report + 1600, target: "finding-0" },
];
const CLICKS = [T.clickAnalyse, T.clickMode, T.clickGoal, T.clickPersona, T.clickStart];

export const DEMO_STEPS = [
  { at: 0, icon: TargetIcon, t: "Set a user task", d: "Add your URL. Phanera analyses the website, then you pick a task or let the agents explore." },
  { at: T.run, icon: UsersIcon, t: "AI personas explore", d: "Each persona works through the task in its own browser, clicking, scrolling and reading like a real user." },
  { at: T.report, icon: ClipboardCheckIcon, t: "Get research insights", d: "Task outcomes, session replays and prioritised usability findings, ready to share." },
];

const last = <X extends { at: number }>(xs: X[], t: number) => xs.reduce<X | null>((acc, x) => (x.at <= t ? x : acc), null);

/* ------------------------------------------------------------------ Clock */
function useClock(ref: React.RefObject<HTMLElement | null>) {
  const [t, setT] = useState(0);
  const [still, setStill] = useState(false);
  const visible = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (visible.current = e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);

  useEffect(() => {
    if (still) return;
    let prev = performance.now();
    const id = window.setInterval(() => {
      const now = performance.now();
      const dt = Math.min(now - prev, 100);
      prev = now;
      if (!visible.current || document.hidden) return;
      setT((x) => (x + dt >= T.end ? 0 : x + dt));
    }, 50);
    return () => window.clearInterval(id);
  }, [still]);

  return { t: still ? T.wizard + 3200 : t, setT, still };
}

/* ------------------------------------------------------------------ Public component */
export function DashboardDemo({ className }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { t, setT, still } = useClock(rootRef);
  const step = t >= T.report ? 2 : t >= T.run ? 1 : 0;

  return (
    <div ref={rootRef} className={className}>
      <Stage t={t} still={still} />
      <ol className="mx-auto mt-6 grid max-w-5xl gap-2 sm:grid-cols-3 sm:gap-4">
        {DEMO_STEPS.map((s, i) => (
          <li key={s.t}>
            <button
              type="button"
              onClick={() => setT(s.at)}
              aria-current={i === step || undefined}
              className={cn(
                "grid w-full gap-1.5 rounded-xl p-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                i === step ? "bg-card ring-1 ring-foreground/10" : "opacity-60 hover:opacity-100",
              )}
            >
              <span className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-lg border border-border bg-background"><s.icon className="size-4" /></span>
                <span className="font-medium">{s.t}</span>
              </span>
              <span className="text-sm text-pretty text-muted-foreground">{s.d}</span>
              {!still && (
                <span className="mt-1 h-0.5 overflow-hidden rounded-full bg-border">
                  <span
                    className="block h-full bg-foreground/70"
                    style={{ width: `${i < step ? 100 : i > step ? 0 : Math.min(100, ((t - s.at) / ((DEMO_STEPS[i + 1]?.at ?? T.end) - s.at)) * 100)}%` }}
                  />
                </span>
              )}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ------------------------------------------------------------------ Stage (scaled "screen") */
function Stage({ t, still }: { t: number; still: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, narrow: false });
  const W = box.narrow ? 760 : 1280;
  const H = box.narrow ? 900 : 780;
  const scale = box.w ? box.w / W : 0;

  useLayoutEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, narrow: e.contentRect.width < 640 }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const scene = t < T.discovery ? "url" : t < T.wizard ? "discovery" : t < T.run ? "wizard" : "test";
  const path = scene === "test" ? "phanera.com/dashboard/tests/8f3c2a" : "phanera.com/dashboard/new";
  const fadeOut = t > T.end - 600;

  return (
    <div
      ref={boxRef}
      aria-hidden
      inert
      className="relative mx-auto w-full max-w-5xl select-none"
      style={{ height: scale ? H * scale : undefined, aspectRatio: scale ? undefined : `${1280} / ${780}` }}
    >
      {scale > 0 && (
        <div
          ref={screenRef}
          className="absolute top-0 left-0 overflow-hidden rounded-xl border border-border bg-white shadow-[0_40px_120px_-40px_rgba(17,17,20,0.35)]"
          style={{
            width: W, height: H, transform: `scale(${scale})`, transformOrigin: "0 0",
            borderRadius: 14 / scale,
            ["--background" as string]: "#ffffff", ["--sidebar" as string]: "#fafafa",
            ["--sidebar-accent" as string]: "#efeff1", ["--sidebar-border" as string]: "#ececee",
          }}
        >
          {/* Browser chrome */}
          <div className="flex h-10 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4">
            <div className="flex gap-1.5">{["#ff5f57", "#febc2e", "#28c840"].map((c) => <span key={c} className="size-3 rounded-full" style={{ background: c }} />)}</div>
            <div className="mx-auto w-[440px] max-w-[60%] truncate rounded-md border border-sidebar-border bg-white px-3 py-1 text-center font-mono text-xs text-muted-foreground">{path}</div>
            <div className="w-12" />
          </div>
          <div className={cn("flex bg-background text-foreground transition-opacity duration-500", fadeOut && "opacity-0")} style={{ height: H - 40 }}>
            {!box.narrow && <Sidebar active={scene === "test" ? "Usability tests" : "New usability test"} />}
            <Main t={t} scene={scene} height={H - 40} />
          </div>
          {!still && <Cursor t={t} screenRef={screenRef} scale={scale} />}
        </div>
      )}
    </div>
  );
}

const NAV = [
  { label: "Dashboard", icon: LayoutDashboardIcon },
  { label: "New usability test", icon: PlusIcon },
  { label: "Websites", icon: GlobeIcon },
  { label: "Usability tests", icon: HistoryIcon },
  { label: "Settings", icon: SettingsIcon },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 px-4 font-medium tracking-tight"><PixelAnt className="h-6 w-auto" />Phanera</div>
      <nav className="grid gap-1 p-2 text-sm">
        {NAV.map(({ label, icon: Icon }) => (
          <span key={label} className={cn("flex h-8 items-center gap-2 rounded-md px-2 [&>svg]:size-4", label === active ? "bg-sidebar-accent font-medium" : "")}>
            <Icon />{label}
          </span>
        ))}
      </nav>
      <div className="mt-auto p-3">
        <div className="grid gap-2 rounded-lg border border-sidebar-border p-3">
          <div className="flex items-center justify-between text-xs"><span className="font-medium">Startup plan</span><span className="text-muted-foreground">7 of 10 left</span></div>
          <Progress value={30} className="h-1" />
          <p className="text-xs text-muted-foreground">Usability tests this month</p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ Main column with "scroll" */
function Main({ t, scene, height }: { t: number; scene: string; height: number }) {
  const contentRef = useRef<HTMLDivElement>(null);
  const target = scene !== "wizard" ? null : t >= T.scrollReview ? "step-review" : t >= T.scrollPersonas ? "step-personas" : null;

  // "Scroll" by translating the page; written straight to the DOM since it's derived from layout.
  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const node = target ? el.querySelector<HTMLElement>(`[data-demo="${target}"]`) : null;
    let y = 0;
    if (node) {
      // Rect deltas (not offsetTop) so nested transforms don't matter; undo the stage scale.
      const box = el.getBoundingClientRect();
      const k = box.height / el.offsetHeight || 1;
      const top = (node.getBoundingClientRect().top - box.top) / k;
      y = Math.min(Math.max(0, el.offsetHeight - height), Math.max(0, top - 24));
    }
    el.style.transform = `translateY(${-y}px)`;
  }, [target, height, scene]);

  return (
    <div className="relative min-w-0 flex-1 overflow-hidden">
      <div
        ref={contentRef}
        className="relative mx-auto w-full max-w-6xl px-8 py-8 transition-transform duration-[900ms] ease-[cubic-bezier(.65,0,.35,1)]"
      >
        <div key={scene} className="animate-in fade-in duration-500">
          {scene === "url" && <SceneUrl t={t} />}
          {scene === "discovery" && <SceneDiscovery t={t} />}
          {scene === "wizard" && <SceneWizard t={t} />}
          {scene === "test" && <SceneTest t={t} />}
        </div>
      </div>
    </div>
  );
}

function Header({ title, description, eyebrow, actions }: { title: React.ReactNode; description?: React.ReactNode; eyebrow?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-border pb-6">
      <div className="min-w-0">
        {eyebrow && <div className="mb-1 text-xs text-muted-foreground">{eyebrow}</div>}
        <h1 className="truncate text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
    </div>
  );
}

const pressed = (t: number, at: number) => t >= at - 120 && t < at + 160;
const Favicon = ({ className }: { className?: string }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={`https://www.google.com/s2/favicons?domain=${DOMAIN}&sz=64`} alt="" className={cn("rounded-sm", className)} />
);

/* ------------------------------------------------------------------ Scene: confirm URL */
function SceneUrl({ t }: { t: number }) {
  const typed = TYPED.slice(0, Math.max(0, Math.floor((t - T.typeStart) / T.typeEvery)));
  const focused = t >= T.typeStart - 200;
  const loading = t >= T.clickAnalyse;
  return (
    <div className="grid gap-6">
      <Header title="New test" description="Start by confirming the website you'd like to explore." />
      <Card>
        <CardHeader>
          <CardTitle>Website</CardTitle>
          <CardDescription>Phanera will read up to 50 public pages to understand your product. Discovery doesn&apos;t use a test run.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1" data-demo="url">
              <Input readOnly tabIndex={-1} value={typed ? `https://${typed}` : ""} placeholder="https://acme.com" className={cn("h-10 font-mono", focused && "border-ring ring-3 ring-ring/50")} />
            </div>
            <Button size="lg" className={cn("h-10 transition-transform", pressed(t, T.clickAnalyse) && "scale-[0.97]")} data-demo="analyse">
              {loading && <Loader2Icon className="animate-spin" />}
              Explore website
              {!loading && <ArrowRightIcon data-icon="inline-end" />}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Or choose a website you&apos;ve already explored</CardTitle></CardHeader>
        <CardContent className="grid gap-1">
          {["acme.dev", "phanera.com"].map((d) => (
            <div key={d} className="flex items-center justify-between rounded-md px-2 py-2">
              <span className="font-mono text-sm">{d}</span>
              <StatusLabel status="complete" className="text-xs" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ Scene: discovery */
function SceneDiscovery({ t }: { t: number }) {
  const local = t - T.discovery;
  const current = STAGES.reduce((acc, s, i) => (s.at <= local ? i : acc), 0);
  const pages = Math.min(PAGES, Math.max(0, Math.round(((local - STAGES[3].at) / (STAGES[4].at - STAGES[3].at)) * PAGES)));
  return (
    <div className="grid gap-6">
      <Header title="New usability test" description="Review the website, choose a user task and AI personas, then start the test." />
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <AntAvatar seed={DOMAIN} size={48} state="active" />
          <div>
            <CardTitle>Analysing <span className="font-mono">{DOMAIN}</span></CardTitle>
            <CardDescription>Mapping pages and understanding the product. This usually takes under a minute.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-2" data-demo="rest-discovery">
            {STAGES.map((s, i) => {
              const done = i < current;
              const active = i === current;
              return (
                <li key={s.label} className={cn("flex items-center gap-3 text-sm", !done && !active && "text-muted-foreground")}>
                  <span className={cn("flex size-5 items-center justify-center rounded-full border", done ? "border-success/40 text-success" : active ? "border-primary/50 text-primary" : "border-border")}>
                    {done ? <CheckIcon className="size-3" /> : active ? <Loader2Icon className="size-3 animate-spin" /> : null}
                  </span>
                  {s.label}
                  {i === 3 && (done || active) && pages > 0 && <span className="font-mono text-xs text-muted-foreground">{pages} pages</span>}
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ Scene: test wizard */
function SceneWizard({ t }: { t: number }) {
  const goalMode = t >= T.clickMode;
  const goalChosen = t >= T.clickGoal ? GOAL_INDEX : -1;
  const selected = PERSONAS.map((_, i) => i < PRESELECTED || t >= T.clickPersona);
  const count = selected.filter(Boolean).length;
  const starting = t >= T.clickStart;

  return (
    <div className="grid gap-6">
      <Header title="New usability test" description="Review the website, choose a user task and AI personas, then start the test." />

      <Step n={1} title="Website">
        <div className="flex items-start gap-3">
          <Favicon className="mt-0.5 size-5" />
          <div className="grid gap-1">
            <p className="font-medium">Stripe <span className="ml-1 font-mono text-xs text-muted-foreground">https://{DOMAIN}</span></p>
            <p className="text-sm text-muted-foreground">Financial infrastructure for accepting payments, sending payouts and managing a business online.</p>
            <p className="text-xs text-muted-foreground">Fintech · Payments platform · {PAGES} pages analysed</p>
          </div>
        </div>
      </Step>

      <Step n={2} title="Goal" description="Let the agents explore the whole site on their own, or give them a specific task.">
        <div className="grid grid-cols-2 gap-3">
          <ModeOption checked={!goalMode} icon={<CompassIcon className="size-4" />} title="Let agent explore" credits={3} badge="Recommended">
            Agents roam the site freely and hunt for broken links, errors, dead ends and confusing content.
          </ModeOption>
          <ModeOption checked={goalMode} pressed={pressed(t, T.clickMode)} icon={<TargetIcon className="size-4" />} title="Set a goal" credits={1} demo="mode-goal">
            Every persona attempts one task you choose, like finding pricing or signing up, and you learn whether they could do it.
          </ModeOption>
        </div>
        {goalMode && (
          <div className="mt-4 grid animate-in gap-2 fade-in slide-in-from-top-1 duration-300">
            <p className="text-sm text-muted-foreground">Pick a suggested task or describe what users should try to do.</p>
            {GOALS.map((g, i) => (
              <div
                key={g}
                data-demo={i === GOAL_INDEX ? "goal" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                  goalChosen === i ? "border-primary/60 bg-primary/5" : "border-border",
                  i === GOAL_INDEX && pressed(t, T.clickGoal) && "scale-[0.995]",
                )}
              >
                <span className={cn("size-3.5 shrink-0 rounded-full border", goalChosen === i ? "border-[4px] border-primary" : "border-muted-foreground/50")} />
                {g}
              </div>
            ))}
          </div>
        )}
      </Step>

      <Step
        n={3}
        demo="step-personas"
        title="Personas"
        description="Every AI persona attempts the same user task above. What differs is what drives them and how that shapes the way they browse. Select up to 5 on the Startup plan."
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm"><RefreshCwIcon /> Regenerate</Button>
            <Button variant="outline" size="sm"><PlusIcon /> Add persona</Button>
          </div>
        }
      >
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PERSONAS.map((p, i) => (
            <div key={p.name} className={cn("flex min-w-0 flex-col gap-3 rounded-xl border p-4 transition-colors", selected[i] ? "border-primary/50 bg-primary/5" : "border-border")}>
              <div className="flex items-start gap-3">
                <span data-demo={i === PRESELECTED ? "persona-check" : undefined} className="mt-1">
                  <Checkbox checked={selected[i]} tabIndex={-1} />
                </span>
                <AntAvatar seed={p.name + p.role} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.role}</p>
                </div>
                <span className="shrink-0 text-muted-foreground">
                  {p.ai ? <BotIcon className="size-4" /> : p.device === "mobile" ? <SmartphoneIcon className="size-4" /> : <MonitorIcon className="size-4" />}
                </span>
              </div>
              <p className="line-clamp-4 text-sm break-words"><span className="text-muted-foreground">Motivation: </span>{p.goal}</p>
              <p className="line-clamp-2 text-xs break-words text-muted-foreground">{p.behaviour}</p>
              <div className="mt-auto flex gap-1">
                <Button variant="ghost" size="xs"><PencilIcon /> Edit</Button>
                <Button variant="ghost" size="xs"><Trash2Icon /> Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </Step>

      <Step n={4} title="Review" demo="step-review">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <Row label="Website"><span className="font-mono">{DOMAIN}</span></Row>
          <Row label="Goal">{goalChosen >= 0 ? GOALS[goalChosen] : "Let agent explore"}</Row>
          <Row label="Personas">{count} selected</Row>
          <Row label="Limits per persona">{MAX_ACTIONS} actions · 8 min</Row>
          <Row label="Pages per website analysis">50</Row>
          <Row label="Usage">Uses <span className="font-medium">1 credit</span> · 7 of 10 remaining this month</Row>
        </dl>
        <Alert className="mt-4">
          <ShieldCheckIcon />
          <AlertDescription>
            Agents browse in isolated sandboxes, stay on <span className="font-mono">{DOMAIN}</span>, never make purchases, never submit forms that change data, and stop at CAPTCHAs or login walls.
          </AlertDescription>
        </Alert>
        <div className="mt-6 flex justify-end">
          <Button size="lg" className={cn("h-10 px-5 transition-transform", pressed(t, T.clickStart) && "scale-[0.97]")} data-demo="start">
            {starting && <Loader2Icon className="animate-spin" />} Start test
          </Button>
        </div>
      </Step>
    </div>
  );
}

function Step({ n, title, description, action, demo, children }: { n: number; title: string; description?: string; action?: React.ReactNode; demo?: string; children: React.ReactNode }) {
  return (
    <Card data-demo={demo}>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-muted-foreground">{n}</span>
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription className="mt-1">{description}</CardDescription>}
          </div>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function ModeOption({ checked, pressed: isPressed, icon, title, credits, badge, demo, children }: { checked: boolean; pressed?: boolean; icon: React.ReactNode; title: string; credits: number; badge?: string; demo?: string; children: React.ReactNode }) {
  return (
    <div
      data-demo={demo}
      className={cn("flex flex-col gap-2 rounded-xl border p-4 text-left transition-all", checked ? "border-primary/60 bg-primary/5" : "border-border", isPressed && "scale-[0.99]")}
    >
      <span className="flex items-center gap-2">
        <span className={cn("size-3.5 shrink-0 rounded-full border", checked ? "border-[4px] border-primary" : "border-muted-foreground/50")} />
        <span className="text-muted-foreground">{icon}</span>
        <span className="font-medium">{title}</span>
        {badge && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{badge}</span>}
        <span className={cn("ml-auto shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px]", credits > 1 ? "border-amber-500/40 bg-amber-500/10 text-amber-700" : "border-border text-muted-foreground")}>
          {credits} {credits === 1 ? "credit" : "credits"}
        </span>
      </span>
      <span className="text-sm text-muted-foreground">{children}</span>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ Scene: live test, then report */
function SceneTest({ t }: { t: number }) {
  const local = t - T.run;
  const beats = RUN.map((b) => last(b, local) ?? b[0]);
  const statusOf = (i: number) => RUN[i].reduce<Beat["status"]>((acc, b) => (b.at <= local && b.status ? b.status : acc), "queued");
  const done = beats.filter((_, i) => statusOf(i) === "completed").length;
  const evaluating = local >= RUN_DONE;
  const report = t >= T.report;
  const testStatus = report ? "complete" : evaluating ? "evaluating" : "running";

  return (
    <div className="grid gap-6">
      <Header
        eyebrow={<span className="font-mono">Usability test · 10 Nov 2026</span>}
        title={<span className="flex items-center gap-2.5"><Favicon className="size-6 rounded" />{DOMAIN}</span>}
        description={<span className="block max-w-3xl text-[15px] leading-snug text-pretty text-muted-foreground">{GOALS[GOAL_INDEX]}</span>}
        actions={<span className="flex items-center gap-3"><StatusLabel status={testStatus} />{report && <Button variant="outline" size="sm">Share report</Button>}</span>}
      />

      {!report ? (
        <Card data-demo="rest-run">
          <CardHeader>
            <CardTitle>{done} of {PERSONAS.length} personas completed</CardTitle>
            <CardDescription>{evaluating ? "All sessions recorded. Generating research insights…" : "Agents are exploring the website in isolated browsers. Statuses update live."}</CardDescription>
            <CardAction><Button variant="outline" size="sm">Stop test</Button></CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {/* The colony at work, as on the real test page. */}
            <div className="bg-studio relative isolate h-48 overflow-hidden rounded-lg border border-border">
              <AntMarch className="[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" />
            </div>
            <Progress value={(done / PERSONAS.length) * 100} className="h-1.5" />
            <ul className="grid gap-2">
              {PERSONAS.map((p, i) => {
                const status = statusOf(i);
                const b = beats[i];
                return (
                  <li key={p.name} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                    <AntAvatar seed={p.name + p.role} size={28} state={status === "running" ? "active" : status === "completed" ? "done" : "idle"} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{p.name} <span className="font-normal text-muted-foreground">· {p.role}</span></p>
                      <p key={b.text} className="truncate text-xs text-muted-foreground animate-in fade-in duration-300">{b.text || " "}</p>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">{b.actions}/{MAX_ACTIONS}</span>
                    <StatusLabel status={status ?? "queued"} className="w-24 justify-end text-xs" />
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ) : (
        <Report t={t - T.report} />
      )}
    </div>
  );
}

function Report({ t }: { t: number }) {
  const outcomes = RUN.map((b) => b[b.length - 1].outcome as Outcome);
  return (
    <div className="grid animate-in gap-6 fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,320px)] overflow-hidden rounded-2xl border border-border">
        <div className="grid content-start gap-3 p-6">
          <span className="font-mono text-[11px] tracking-[0.18em] text-muted-foreground uppercase">Test results</span>
          <div className="flex items-start gap-3">
            <CheckCircle2Icon className="mt-1 size-6 shrink-0 text-success" />
            <h2 className="text-2xl leading-tight font-semibold tracking-tight text-balance">3 of 4 personas completed the task</h2>
          </div>
          <p className="max-w-prose leading-relaxed text-pretty text-muted-foreground">
            Mostly. Pricing is one click from the homepage and UK and EU card rates are up front, but the rate for cards from outside Europe, and the extra 2% for currency conversion, sit three screens further down.
          </p>
        </div>
        <dl className="grid grid-cols-3 border-l border-border">
          <Count label="High" value={1} tone="text-destructive" />
          <Count label="Medium" value={2} tone="text-warning" />
          <Count label="Low" value={1} />
          <div className="col-span-3 grid gap-2 border-t border-border p-5">
            <dt className="text-xs text-muted-foreground">{PERSONAS.length} personas tested</dt>
            <dd className="flex flex-wrap gap-1.5">
              {PERSONAS.map((p, i) => (
                <span key={p.name} className="flex items-center gap-1.5 rounded-full border border-border py-0.5 pr-2.5 pl-0.5 text-xs">
                  <AntAvatar seed={p.name + p.role} size={20} state="done" />
                  <span className="font-medium">{p.name}</span>
                  <OutcomeLabel outcome={outcomes[i]} className="text-xs" />
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </div>

      <div className="grid gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Usability findings</h2>
          <p className="text-sm text-muted-foreground">Prioritised by severity. Open a finding for the evidence and the recommended fix.</p>
        </div>
        <ul className="grid gap-2">
          {FINDINGS.map((f, i) =>
            t >= 600 + i * 350 ? (
              <li key={f.t} data-demo={`finding-${i}`} className="flex animate-in items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 fade-in slide-in-from-bottom-1 duration-300">
                <span className={cn("size-2 shrink-0 rounded-full", f.tone)} />
                <span className="w-16 shrink-0 text-xs text-muted-foreground">{f.sev}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{f.t}</span>
                <span className="flex -space-x-1">{f.p.map((n) => <AntAvatar key={n} seed={n + PERSONAS.find((x) => x.name === n)!.role} size={20} className="rounded-full bg-card ring-2 ring-card" />)}</span>
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </div>
  );
}

function Count({ label, value, tone }: { label: string; value: number; tone?: string }) {
  return (
    <div className="grid gap-0.5 border-border p-5 not-last:border-r">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("font-mono text-2xl tabular-nums", value > 0 && tone)}>{value}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ Cursor */
function Cursor({ t, screenRef, scale }: { t: number; screenRef: React.RefObject<HTMLDivElement | null>; scale: number }) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const target = last(CURSOR, t)?.target ?? null;

  // Re-measure every tick: targets move while the page "scrolls".
  useLayoutEffect(() => {
    const screen = screenRef.current;
    if (!screen || !target) return;
    const el = screen.querySelector<HTMLElement>(`[data-demo="${target}"]`);
    if (!el) return;
    const s = screen.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const isRest = target.startsWith("rest");
    const x = (r.left - s.left + (isRest ? r.width * 0.8 : Math.min(r.width / 2, 60))) / scale;
    const y = (r.top - s.top + (isRest ? r.height * 0.4 : r.height / 2)) / scale;
    setPos((p) => (p && Math.abs(p.x - x) < 0.5 && Math.abs(p.y - y) < 0.5 ? p : { x, y }));
  }, [t, target, screenRef, scale]);

  const clickAt = CLICKS.find((c) => t >= c - 120 && t < c + 450);
  if (!pos) return null;
  return (
    <div
      className="pointer-events-none absolute top-0 left-0 z-20 transition-transform duration-700 ease-[cubic-bezier(.45,0,.2,1)]"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
    >
      {clickAt !== undefined && (
        <span key={clickAt} className="absolute -top-5 -left-5 size-10 animate-ping rounded-full bg-primary/25" />
      )}
      <svg width="22" height="26" viewBox="0 0 22 26" className={cn("drop-shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition-transform", clickAt !== undefined && t < clickAt + 160 && "scale-90")}>
        <path d="M2 1.5 L2 20.5 L7 16 L10.5 24 L14 22.5 L10.6 14.8 L17.5 14.5 Z" fill="#111114" stroke="#fff" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
