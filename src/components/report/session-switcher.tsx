"use client";

import { useEffect, useRef, useState } from "react";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { OutcomeLabel, StatusLabel } from "@/components/sessions/status";
import { cn } from "@/lib/utils";
import type { Outcome } from "@/types/database";

type Item = { id: string; name: string; role: string; status: string; outcome: Outcome | null };

/**
 * Persona pills with one session open inline. Links to `#session-<id>` anywhere on the page
 * (e.g. the persona chips in the overview) select that persona and scroll here.
 */
export function SessionSwitcher({ items, panels }: { items: Item[]; panels: React.ReactNode[] }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const select = (hash: string, scroll: boolean) => {
      const i = items.findIndex((it) => `#session-${it.id}` === hash);
      if (i < 0) return false;
      setIdx(i);
      if (scroll) requestAnimationFrame(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
      return true;
    };
    select(window.location.hash, true);
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#session-']");
      if (a && select(a.getAttribute("href") ?? "", true)) {
        e.preventDefault();
        history.replaceState(null, "", a.getAttribute("href"));
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [items]);

  const current = items[idx];
  return (
    // One framed panel: persona tabs sit on its top edge, the chosen session fills it.
    <div ref={ref} className="scroll-mt-24 overflow-hidden rounded-2xl border border-border">
      <div className="flex overflow-x-auto border-b border-border bg-background" role="tablist" aria-label="Personas">
        {items.map((it, i) => (
          <button
            key={it.id}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={cn(
              "relative flex shrink-0 items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors outline-none focus-visible:bg-muted",
              i === idx ? "text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
            )}
          >
            <AntAvatar seed={it.name + it.role} size={24} state={it.status === "failed" ? "failed" : "done"} />
            <span className="grid">
              <span className="font-medium">{it.name}</span>
              {it.outcome ? <OutcomeLabel outcome={it.outcome} className="text-xs" /> : <StatusLabel status={it.status} className="text-xs" />}
            </span>
            {i === idx && <span aria-hidden className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-foreground" />}
          </button>
        ))}
      </div>
      {current && (
        <div role="tabpanel" aria-label={`${current.name}, ${current.role}`} className="grid gap-4 bg-[#f6f6f7] p-4 sm:p-6">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <h3 className="text-xl font-medium tracking-tight">{current.name}</h3>
            <span className="text-muted-foreground">{current.role}</span>
          </div>
          {panels[idx]}
        </div>
      )}
    </div>
  );
}
