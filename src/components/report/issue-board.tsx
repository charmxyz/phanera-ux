"use client";

import { useState } from "react";
import { ArrowUpRightIcon, ExternalLinkIcon, UsersIcon, WrenchIcon } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SeverityBadge } from "@/components/findings/severity-badge";
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

const COLUMNS = [
  { key: "low", label: "Low", hint: "Nice to fix", dot: "bg-muted-foreground/50", match: ["low"], order: "max-md:order-3" },
  { key: "medium", label: "Medium", hint: "Worth fixing soon", dot: "bg-warning", match: ["medium"], order: "max-md:order-2" },
  { key: "high", label: "High", hint: "Fix these first", dot: "bg-destructive", match: ["high", "critical"], order: "max-md:order-1" },
] as const;

const CONFIDENCE = { confirmed: "Confirmed in a screenshot", likely: "Likely", hypothesis: "Hypothesis" };
const label = (c: string) => c.replace(/_/g, " ");

/** Issues as a board: low → medium → high. Clicking a ticket opens its detail and fix in a side panel. */
export function IssueBoard({ tickets }: { tickets: Ticket[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = tickets.find((t) => t.id === openId) ?? null;

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => {
          const items = tickets.filter((t) => (col.match as readonly string[]).includes(t.severity));
          // On phones the columns stack, most urgent first.
          return (
            <div key={col.key} className={cn("flex flex-col gap-3 rounded-2xl bg-[#f6f6f7] p-3", col.order)}>
              <div className="flex items-center justify-between px-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className={cn("size-2 rounded-full", col.dot)} />
                  <span className="font-medium">{col.label}</span>
                  <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground tabular-nums">{items.length}</span>
                </div>
                <span className="text-xs text-muted-foreground">{col.hint}</span>
              </div>
              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">No {col.label.toLowerCase()} issues</p>
              ) : (
                items.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setOpenId(t.id)}
                    className="group grid gap-3 rounded-xl border border-border bg-background p-3.5 text-left shadow-xs transition-all outline-none hover:-translate-y-px hover:border-foreground/25 hover:shadow-sm focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs text-muted-foreground capitalize">{label(t.category)}</span>
                      {t.severity === "critical" ? <SeverityBadge severity="critical" /> : <ArrowUpRightIcon className="size-4 text-muted-foreground/60 transition-colors group-hover:text-foreground" />}
                    </div>
                    <p className="line-clamp-3 leading-snug font-medium">{t.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UsersIcon className="size-3.5" />
                      <span className="truncate">{t.personas.join(", ") || "General"}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          );
        })}
      </div>

      <Sheet open={open !== null} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent side="right" className="gap-0 overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          {open && (
            <>
              <SheetHeader className="gap-3 border-b border-border p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <SeverityBadge severity={open.severity} />
                  <span className="capitalize">{label(open.category)}</span>
                  <span>·</span>
                  <span>{CONFIDENCE[open.confidence]}</span>
                </div>
                <SheetTitle className="text-xl leading-snug font-semibold tracking-tight">{open.title}</SheetTitle>
                <SheetDescription className="text-[15px] leading-relaxed text-foreground/80">{open.description}</SheetDescription>
              </SheetHeader>

              <div className="grid gap-6 p-6">
                <div className="grid gap-2 rounded-xl border border-success/25 bg-success/5 p-4">
                  <span className="flex items-center gap-2 text-sm font-medium"><WrenchIcon className="size-4 text-success" />Recommended fix</span>
                  <p className="leading-relaxed">{open.recommendation}</p>
                </div>

                {open.shot && (
                  <figure className="grid gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL */}
                    <img src={open.shot.url} alt={`Evidence: ${open.shot.caption}`} className="rounded-lg border border-border" />
                    <figcaption className="font-mono text-xs text-muted-foreground">{open.shot.caption}</figcaption>
                  </figure>
                )}

                {open.evidence.length > 0 && (
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Evidence</span>
                    <ol className="grid gap-2">
                      {open.evidence.map((e, i) => (
                        <li key={i} className="grid gap-0.5 rounded-lg border border-border px-3 py-2.5">
                          <span className="font-mono text-xs text-muted-foreground">{e.persona}{e.step != null ? ` · step ${e.step}` : ""}</span>
                          <span className="leading-relaxed">{e.note}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <dl className="grid gap-3 border-t border-border pt-5 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Affected personas</dt><dd className="text-right">{open.personas.join(", ") || "—"}</dd></div>
                  {open.pageUrl && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-muted-foreground">Page</dt>
                      <dd className="min-w-0">
                        <a href={open.pageUrl} target="_blank" rel="noreferrer noopener" className="inline-flex max-w-full items-center gap-1 font-mono text-xs hover:underline">
                          <span className="truncate">{open.pageUrl.replace(/^https?:\/\//, "")}</span><ExternalLinkIcon className="size-3 shrink-0" />
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
