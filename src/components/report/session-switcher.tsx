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
    <div ref={ref} className="grid scroll-mt-32 gap-4">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Personas">
        {items.map((it, i) => (
          <button
            key={it.id}
            role="tab"
            aria-selected={i === idx}
            onClick={() => setIdx(i)}
            className={cn(
              "flex items-center gap-2.5 rounded-xl border py-2 pr-4 pl-2 text-left text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              i === idx ? "border-foreground/40 bg-card shadow-xs" : "border-border bg-card/60 hover:bg-card",
            )}
          >
            <AntAvatar seed={it.name + it.role} size={26} state={it.status === "failed" ? "failed" : "done"} />
            <span className="grid">
              <span className="font-medium">{it.name}</span>
              {it.outcome ? <OutcomeLabel outcome={it.outcome} className="text-xs" /> : <StatusLabel status={it.status} className="text-xs" />}
            </span>
          </button>
        ))}
      </div>
      {current && (
        <div role="tabpanel" aria-label={`${current.name}, ${current.role}`} className="grid gap-4">
          <div className="flex items-baseline gap-2">
            <h3 className="text-xl font-medium tracking-tight">{current.name}</h3>
            <span className="text-muted-foreground">{current.role}</span>
          </div>
          {panels[idx]}
        </div>
      )}
    </div>
  );
}
