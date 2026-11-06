"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BotIcon, Loader2Icon, MonitorIcon, PencilIcon, PlusIcon, RefreshCwIcon, ShieldCheckIcon, SmartphoneIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { PersonaEditor } from "@/components/personas/persona-editor";
import { createTest, regeneratePersonas } from "@/app/actions/dashboard";
import type { Persona } from "@/lib/claude/schemas";
import { cn } from "@/lib/utils";

type Props = {
  website: { id: string; url: string; domain: string; name: string; description: string; type: string; pageCount: number };
  suggestedGoals: string[];
  suggestedPersonas: Persona[];
  limits: { personasPerTest: number; pagesPerScan: number; maxActionsPerPersona: number; maxDurationMin: number; planLabel: string };
  usage: { remaining: number; allowance: number; period: "lifetime" | "month" };
};

type Item = { persona: Persona; selected: boolean; key: string };

let keySeq = 0;
const toItems = (ps: Persona[], max: number): Item[] => ps.map((p, i) => ({ persona: p, selected: i < max, key: `p${keySeq++}` }));

export function TestWizard({ website, suggestedGoals, suggestedPersonas, limits, usage }: Props) {
  const router = useRouter();
  const [goalChoice, setGoalChoice] = useState<string>(suggestedGoals[0] ?? "__custom");
  const [customGoal, setCustomGoal] = useState("");
  const [items, setItems] = useState<Item[]>(() => toItems(suggestedPersonas, limits.personasPerTest));
  const [editing, setEditing] = useState<{ key: string | null; persona: Persona | null } | null>(null);
  const [regenPending, startRegen] = useTransition();
  const [startPending, startStart] = useTransition();

  const goal = goalChoice === "__custom" ? customGoal.trim() : goalChoice;
  const selected = items.filter((i) => i.selected);
  const overLimit = selected.length > limits.personasPerTest;
  const outOfUsage = usage.remaining <= 0;
  const canStart = goal.length >= 5 && selected.length > 0 && !overLimit && !outOfUsage;

  const regenerate = () =>
    startRegen(async () => {
      const res = await regeneratePersonas(website.id, goal);
      if (res.ok) setItems(toItems(res.personas, limits.personasPerTest));
      else toast.error(res.error);
    });

  const start = () =>
    startStart(async () => {
      const res = await createTest({ websiteId: website.id, goal, personas: selected.map((s) => s.persona) });
      if (res.ok) router.push(`/dashboard/tests/${res.testId}`);
      else toast.error(res.error);
    });

  return (
    <div className="grid gap-6">
      {/* Step 1 */}
      <Step n={1} title="Website">
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="mt-0.5 size-5 rounded-sm" />
          <div className="grid gap-1">
            <p className="font-medium">{website.name} <span className="ml-1 font-mono text-xs text-muted-foreground">{website.url}</span></p>
            <p className="text-sm text-muted-foreground">{website.description}</p>
            <p className="text-xs text-muted-foreground">{website.type} · {website.pageCount} pages discovered</p>
          </div>
        </div>
      </Step>

      {/* Step 2 */}
      <Step n={2} title="Test goal" description="Pick a suggested goal or describe your own.">
        <div className="grid gap-2" role="radiogroup" aria-label="Test goal">
          {suggestedGoals.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={goalChoice === g}
              onClick={() => setGoalChoice(g)}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                goalChoice === g ? "border-primary/60 bg-primary/5" : "border-border hover:bg-accent/50",
              )}
            >
              <span className={cn("size-3.5 shrink-0 rounded-full border", goalChoice === g ? "border-[4px] border-primary" : "border-muted-foreground/50")} />
              {g}
            </button>
          ))}
          <div className={cn("grid gap-2 rounded-lg border px-3 py-2.5", goalChoice === "__custom" ? "border-primary/60 bg-primary/5" : "border-border")}>
            <Label htmlFor="custom-goal" className="text-sm font-normal">What would you like to test?</Label>
            <Textarea
              id="custom-goal"
              rows={2}
              maxLength={500}
              placeholder="e.g. Can a small agency owner figure out whether the Startup plan includes white-label reports?"
              value={customGoal}
              onFocus={() => setGoalChoice("__custom")}
              onChange={(e) => {
                setGoalChoice("__custom");
                setCustomGoal(e.target.value);
              }}
            />
          </div>
        </div>
      </Step>

      {/* Step 3 */}
      <Step
        n={3}
        title="Personas"
        description={`Every persona attempts the goal above, each with their own motivation and browsing style. Select up to ${limits.personasPerTest} on the ${limits.planLabel} plan.`}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={regenerate} disabled={regenPending}>
              {regenPending ? <Loader2Icon className="animate-spin" /> : <RefreshCwIcon />} Regenerate
            </Button>
            <Button variant="outline" size="sm" onClick={() => setEditing({ key: null, persona: null })}>
              <PlusIcon /> Custom
            </Button>
          </div>
        }
      >
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.key}
              className={cn("flex min-w-0 flex-col gap-3 rounded-xl border p-4 transition-colors", it.selected ? "border-primary/50 bg-primary/5" : "border-border")}
            >
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={it.selected}
                  onCheckedChange={(v) => setItems((xs) => xs.map((x) => (x.key === it.key ? { ...x, selected: Boolean(v) } : x)))}
                  aria-label={`Include ${it.persona.name}`}
                  className="mt-1"
                />
                <AntAvatar seed={it.persona.name + it.persona.role} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{it.persona.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{it.persona.role}</p>
                </div>
                <span className="shrink-0 text-muted-foreground" title={it.persona.kind === "ai_agent" ? "AI agent" : it.persona.device}>
                  {it.persona.kind === "ai_agent" ? <BotIcon className="size-4" /> : it.persona.device === "mobile" ? <SmartphoneIcon className="size-4" /> : <MonitorIcon className="size-4" />}
                </span>
              </div>
              <p className="line-clamp-4 text-sm break-words" title={it.persona.goal}><span className="text-muted-foreground">Motivation: </span>{it.persona.goal}</p>
              {it.persona.behaviour && <p className="line-clamp-2 text-xs break-words text-muted-foreground" title={it.persona.behaviour}>{it.persona.behaviour}</p>}
              <div className="mt-auto flex gap-1">
                <Button variant="ghost" size="xs" onClick={() => setEditing({ key: it.key, persona: it.persona })}><PencilIcon /> Edit</Button>
                <Button variant="ghost" size="xs" onClick={() => setItems((xs) => xs.filter((x) => x.key !== it.key))}><Trash2Icon /> Remove</Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-muted-foreground">No personas. Regenerate suggestions or add a custom persona.</p>}
        </div>
        {overLimit && <p className="mt-3 text-sm text-destructive">Select at most {limits.personasPerTest} personas.</p>}
      </Step>

      {/* Step 4 */}
      <Step n={4} title="Review">
        <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Row label="Website"><span className="font-mono">{website.domain}</span></Row>
          <Row label="Goal">{goal || <span className="text-muted-foreground">Not set</span>}</Row>
          <Row label="Personas">{selected.length} selected</Row>
          <Row label="Limits per persona">{limits.maxActionsPerPersona} actions · {limits.maxDurationMin} min</Row>
          <Row label="Maximum pages per scan">{limits.pagesPerScan}</Row>
          <Row label="Usage">
            Uses 1 test run · {usage.remaining} of {usage.allowance} remaining{usage.period === "month" ? " this month" : ""}
          </Row>
        </dl>
        <Alert className="mt-4">
          <ShieldCheckIcon />
          <AlertDescription>
            Agents browse in isolated sandboxes, stay on <span className="font-mono">{website.domain}</span>, never make purchases, never submit forms that change data, and stop at CAPTCHAs or login walls.
          </AlertDescription>
        </Alert>
        {outOfUsage && (
          <Alert variant="destructive" className="mt-3">
            <AlertDescription>
              You&apos;ve used all {usage.allowance} test runs {usage.period === "lifetime" ? `included in the ${limits.planLabel} plan` : "for this month"}.{" "}
              {usage.period === "lifetime" && <Link href="/dashboard/settings#billing" className="font-medium underline underline-offset-2">Upgrade to Startup</Link>}
            </AlertDescription>
          </Alert>
        )}
        <div className="mt-6 flex justify-end">
          <Button size="lg" className="h-10 px-5" disabled={!canStart || startPending} onClick={start}>
            {startPending && <Loader2Icon className="animate-spin" />} Start test
          </Button>
        </div>
      </Step>

      <PersonaEditor
        open={editing !== null}
        persona={editing?.persona ?? null}
        onOpenChange={(o) => !o && setEditing(null)}
        onSave={(p) => {
          setItems((xs) =>
            editing?.key
              ? xs.map((x) => (x.key === editing.key ? { ...x, persona: p } : x))
              : [...xs, { persona: p, selected: xs.filter((x) => x.selected).length < limits.personasPerTest, key: `p${keySeq++}` }],
          );
          setEditing(null);
        }}
      />
    </div>
  );
}

function Step({ n, title, description, action, children }: { n: number; title: string; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-0.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}
