"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** Sticky section pills for the one-page report: jump to a section, highlight the one in view. */
export function ReportNav({ items }: { items: { id: string; label: string }[] }) {
  const [current, setCurrent] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => Boolean(e));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav aria-label="Report sections" className="sticky top-14 z-30 -mx-4 bg-background/85 px-4 py-2 backdrop-blur sm:mx-0 sm:px-0">
      <div className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-lg bg-muted p-[3px]">
        {items.map((i) => (
          <a
            key={i.id}
            href={`#${i.id}`}
            onClick={(e) => {
              e.preventDefault();
              setCurrent(i.id);
              document.getElementById(i.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              history.replaceState(null, "", `#${i.id}`);
            }}
            aria-current={current === i.id ? "true" : undefined}
            className={cn(
              "rounded-md px-3 py-1 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              current === i.id ? "bg-background text-foreground shadow-sm" : "text-foreground/60 hover:text-foreground",
            )}
          >
            {i.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
