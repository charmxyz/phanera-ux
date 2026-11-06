"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRightIcon, ChevronDownIcon, ChevronUpIcon, CircleDotIcon, ExternalLinkIcon, FileTextIcon,
  GaugeIcon, GlobeIcon, ImageIcon, ListChecksIcon, ShieldCheckIcon, TagIcon, UsersIcon, WrenchIcon,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { cn } from "@/lib/utils";

export type Ticket = {
  id: string;
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  category: string;
  confidence: "confirmed" | "likely" | "hypothesis";
  personas: string[];
  pageUrl: string | null;
  recommendation: string;
  evidence: { persona: string; step: number | null; note: string }[];
  shot: { url: string; caption: string } | null;
};

type PersonaRef = { name: string; role: string };

const COLUMNS = [
  { key: "low", label: "Low", hint: "Nice to fix", dot: "bg-muted-foreground/50", match: ["low"], order: "max-lg:order-3" },
  { key: "medium", label: "Medium", hint: "Worth fixing soon", dot: "bg-warning", match: ["medium"], order: "max-lg:order-2" },
  { key: "high", label: "High", hint: "Fix these first", dot: "bg-destructive", match: ["high", "critical"], order: "max-lg:order-1" },
] as const;

const SEVERITY = {
  critical: { label: "Critical", cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  high: { label: "High", cls: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
  medium: { label: "Medium", cls: "bg-warning/10 text-warning", dot: "bg-warning" },
  low: { label: "Low", cls: "bg-muted text-muted-foreground", dot: "bg-muted-foreground/50" },
};
const CONFIDENCE = {
  confirmed: { label: "Confirmed", hint: "Seen in a recorded step or screenshot", cls: "text-success" },
  likely: { label: "Likely", hint: "Strongly implied by the session", cls: "text-warning" },
  hypothesis: { label: "Hypothesis", hint: "Plausible, not directly observed", cls: "text-muted-foreground" },
};
/** Display names for finding categories (stored values stay unchanged). */
const CATEGORY: Record<string, string> = { agent_readiness: "AI accessibility" };
const words = (c: string) => CATEGORY[c] ?? c.replace(/_/g, " ");
/** "Priya (Head of Operations)" → "Priya" */
const shortName = (p: string) => p.replace(/\s*\(.*$/, "").trim();

/** Issues as a board: low → medium → high. Clicking a ticket opens it as a side panel. */
export function IssueBoard({ tickets, personas }: { tickets: Ticket[]; personas: PersonaRef[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const idx = tickets.findIndex((t) => t.id === openId);
  const open = idx >= 0 ? tickets[idx] : null;
  const key = (t: Ticket) => `F-${tickets.indexOf(t) + 1}`;
  const seed = (p: string) => {
    const match = personas.find((x) => shortName(p) === x.name);
    return match ? match.name + match.role : p;
  };

  // j / k (or arrows) move between tickets while the panel is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "j"].includes(e.key) && idx < tickets.length - 1) setOpenId(tickets[idx + 1].id);
      if (["ArrowUp", "k"].includes(e.key) && idx > 0) setOpenId(tickets[idx - 1].id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, idx, tickets]);

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))]">
        {COLUMNS.map((col) => {
          const items = tickets.filter((t) => (col.match as readonly string[]).includes(t.severity));
          // On narrower screens the columns stack, most urgent first.
          return (
            <div key={col.key} className={cn("flex min-w-0 flex-col gap-2.5 rounded-2xl bg-[#f6f6f7] p-2.5 sm:p-3", col.order)}>
              <div className="flex items-center justify-between gap-2 px-1.5 pt-1 pb-0.5">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", col.dot)} />
                  <span className="font-medium">{col.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </div>
                <span className="truncate text-xs text-muted-foreground">{col.hint}</span>
              </div>
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No {col.label.toLowerCase()}-severity findings</p>
              ) : (
                items.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className="group grid w-full min-w-0 gap-2.5 rounded-xl border border-border bg-background p-3.5 text-left shadow-xs transition-all outline-none hover:border-foreground/25 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="font-mono">{key(t)}</span>
                        <span>·</span>
                        <span className="truncate capitalize">{words(t.category)}</span>
                      </span>
                      <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-foreground" />
                    </div>
                    <p className="line-clamp-3 leading-snug font-medium [overflow-wrap:anywhere]">{t.title}</p>
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <div className="flex shrink-0 -space-x-1.5">
                        {t.personas.slice(0, 4).map((p) => (
                          <span key={p} className="rounded-full bg-background ring-2 ring-background" title={p}>
                            <AntAvatar seed={seed(p)} size={20} />
                          </span>
                        ))}
                      </div>
                      <span className="min-w-0 truncate text-xs text-muted-foreground">{t.personas.map(shortName).join(", ") || "General"}</span>
                    </div>
                    {t.severity === "critical" && <span className="w-fit rounded bg-destructive px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">Critical</span>}
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>

      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" showCloseButton={false} className="gap-0 overflow-y-auto bg-white data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
          {open && (
            <>
              {/* Toolbar: breadcrumb, prev/next, close */}
              <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur sm:px-6">
                <div className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                  <span>Usability findings</span><span>/</span>
                  <span className="flex items-center gap-1"><span className={cn("size-1.5 rounded-full", SEVERITY[open.severity].dot)} />{SEVERITY[open.severity].label}</span>
                  <span>/</span><span className="font-mono text-foreground">{key(open)}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <IconBtn label="Previous issue" disabled={idx <= 0} onClick={() => setOpenId(tickets[idx - 1].id)}><ChevronUpIcon /></IconBtn>
                  <IconBtn label="Next issue" disabled={idx >= tickets.length - 1} onClick={() => setOpenId(tickets[idx + 1].id)}><ChevronDownIcon /></IconBtn>
                  <span className="mx-1 h-4 w-px bg-border" />
                  <IconBtn label="Close" onClick={() => setOpenId(null)}><span className="text-base leading-none">×</span></IconBtn>
                </div>
              </div>

              <div className="grid gap-7 px-4 py-6 sm:px-8 sm:py-8">
                <SheetTitle className="text-2xl leading-tight font-semibold tracking-tight [overflow-wrap:anywhere]">{open.title}</SheetTitle>

                {/* Properties, Notion-style */}
                <dl className="grid gap-y-1 text-sm">
                  <Prop icon={<GaugeIcon />} label="Severity">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium", SEVERITY[open.severity].cls)}>
                      <span className={cn("size-1.5 rounded-full", SEVERITY[open.severity].dot)} />{SEVERITY[open.severity].label}
                    </span>
                  </Prop>
                  <Prop icon={<TagIcon />} label="Category">
                    <span className="rounded-md bg-muted px-2 py-0.5 text-xs capitalize">{words(open.category)}</span>
                  </Prop>
                  <Prop icon={<ShieldCheckIcon />} label="Confidence">
                    <span className={cn("text-sm", CONFIDENCE[open.confidence].cls)}>{CONFIDENCE[open.confidence].label}</span>
                    <span className="ml-2 text-xs text-muted-foreground max-sm:hidden">{CONFIDENCE[open.confidence].hint}</span>
                  </Prop>
                  <Prop icon={<UsersIcon />} label="Affected">
                    <span className="flex flex-wrap gap-1.5">
                      {open.personas.length ? open.personas.map((p) => (
                        <span key={p} className="inline-flex items-center gap-1.5 rounded-full border border-border py-0.5 pr-2 pl-0.5 text-xs" title={p}>
                          <AntAvatar seed={seed(p)} size={18} />{shortName(p)}
                        </span>
                      )) : <span className="text-muted-foreground">General</span>}
                    </span>
                  </Prop>
                  {open.pageUrl && (
                    <Prop icon={<GlobeIcon />} label="Page">
                      <a href={open.pageUrl} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full min-w-0 items-center gap-1 font-mono text-xs hover:underline">
                        <span className="truncate">{open.pageUrl.replace(/^https?:\/\/(www\.)?/, "")}</span><ExternalLinkIcon className="size-3 shrink-0" />
                      </a>
                    </Prop>
                  )}
                </dl>

                <Block icon={<FileTextIcon />} title="Description">
                  <SheetDescription className="text-[15px] leading-relaxed text-foreground">{open.description}</SheetDescription>
                </Block>

                <Block icon={<WrenchIcon />} title="Recommended fix">
                  <div className="flex gap-3 rounded-xl border border-success/25 bg-success/5 p-4">
                    <ListChecksIcon className="mt-0.5 size-4 shrink-0 text-success" />
                    <p className="leading-relaxed">{open.recommendation}</p>
                  </div>
                </Block>

                {open.shot && (
                  <Block icon={<ImageIcon />} title="Attachment">
                    <a href={open.shot.url} target="_blank" rel="noreferrer" className="group block overflow-hidden rounded-xl border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                      <img src={open.shot.url} alt={`Evidence: ${open.shot.caption}`} className="block w-full transition-opacity group-hover:opacity-90" />
                      <span className="flex items-center justify-between gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                        <span className="font-mono">{open.shot.caption}</span><ExternalLinkIcon className="size-3" />
                      </span>
                    </a>
                  </Block>
                )}

                {open.evidence.length > 0 && (
                  <Block icon={<CircleDotIcon />} title={`Evidence · ${open.evidence.length}`}>
                    <ol className="relative grid gap-4 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-px before:bg-border">
                      {open.evidence.map((e, i) => (
                        <li key={i} className="relative flex gap-3">
                          <span className="relative z-10 h-fit rounded-full bg-white ring-4 ring-white"><AntAvatar seed={seed(e.persona)} size={22} /></span>
                          <div className="grid min-w-0 gap-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="font-medium text-foreground">{shortName(e.persona)}</span>
                              {e.step != null && <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-muted-foreground">step {e.step}</span>}
                            </div>
                            <p className="text-sm leading-relaxed [overflow-wrap:anywhere]">{e.note}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </Block>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}

function Prop({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] items-center gap-3 rounded-md py-1.5 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <dt className="flex items-center gap-2 text-muted-foreground [&_svg]:size-4">{icon}{label}</dt>
      <dd className="flex min-w-0 items-center">{children}</dd>
    </div>
  );
}

function Block({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-border pt-6">
      <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground [&_svg]:size-4">{icon}{title}</h3>
      {children}
    </section>
  );
}

function IconBtn({ label, disabled, onClick, children }: { label: string; disabled?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4">
      {children}
    </button>
  );
}
