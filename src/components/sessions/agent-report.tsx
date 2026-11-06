import { BotIcon, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The agent's own final report, made scannable: the run-on text is split into points,
 * labelled sections ("Gaps: …", "Key pages: …") get a heading, and URLs become short links.
 */
export function AgentReport({ text, className, preview = 3, heading = true }: { text: string; className?: string; preview?: number; heading?: boolean }) {
  const points = reportPoints(text);
  const head = points.slice(0, preview);
  const rest = points.slice(preview);
  return (
    <div className={cn("grid gap-3", className)}>
      {heading && <span className="flex items-center gap-2 text-sm font-medium"><BotIcon className="size-4 text-muted-foreground" />Agent&apos;s own report</span>}
      <ReportList points={head} />
      {rest.length > 0 && (
        <details className="group">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1 text-xs text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
            <span className="group-open:hidden">Show {rest.length} more</span>
            <span className="hidden group-open:inline">Show less</span>
            <ChevronDownIcon className="size-3.5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="pt-3"><ReportList points={rest} /></div>
        </details>
      )}
    </div>
  );
}

function ReportList({ points }: { points: string[] }) {
  return (
    <ul className="grid gap-2.5 text-sm">
      {points.map((pt, i) => {
        const m = /^([A-Z][\w /&-]{1,40}?):\s+([\s\S]*)$/.exec(pt);
        return (
          <li key={i} className="flex gap-2.5 leading-relaxed">
            <span className="mt-2.5 size-1 shrink-0 rounded-full bg-muted-foreground/60" />
            <span className="min-w-0 break-words">
              {m ? (
                <>
                  <span className="font-medium">{m[1]}: </span>
                  <Linkified text={m[2]} />
                </>
              ) : (
                <Linkified text={pt} />
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

/** Splits the agent's run-on report into readable points (sentence / clause boundaries). */
export function reportPoints(text: string): string[] {
  return text
    .split(/(?<=[.;])\s+(?=[A-Z])/)
    .map((t) => t.trim())
    .filter(Boolean);
}

/** Renders URLs as compact links so long reports stay scannable. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s,;)]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (!/^https?:\/\//.test(part)) return <span key={i}>{part}</span>;
        const href = part.replace(/[.]$/, "");
        return (
          <a key={i} href={href} target="_blank" rel="noreferrer noopener" className="font-mono text-xs text-muted-foreground underline decoration-border underline-offset-2 hover:text-foreground">
            {href.replace(/^https?:\/\/(www\.)?/, "")}
          </a>
        );
      })}
    </>
  );
}
