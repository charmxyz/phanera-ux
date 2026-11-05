import { CheckIcon, Loader2Icon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AntAvatar } from "@/components/ants/pixel-ant";
import { cn } from "@/lib/utils";
import type { DiscoveryStatus } from "@/types/database";

const STAGES: { key: DiscoveryStatus; label: string }[] = [
  { key: "queued", label: "Queued" },
  { key: "fetching", label: "Fetching website" },
  { key: "discovering", label: "Discovering pages" },
  { key: "extracting", label: "Extracting content" },
  { key: "analysing", label: "Analysing website" },
];

/** Reflects the real worker status stored on the website row. */
export function DiscoveryProgress({ status, domain, pageCount }: { status: DiscoveryStatus; domain: string; pageCount: number }) {
  const current = STAGES.findIndex((s) => s.key === status);
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <AntAvatar seed={domain} size={48} state="active" />
        <div>
          <CardTitle>Discovering <span className="font-mono">{domain}</span></CardTitle>
          <CardDescription>Mapping pages and understanding the product. This usually takes under a minute.</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2" aria-live="polite">
          {STAGES.map((s, i) => {
            const done = i < current;
            const active = i === current;
            return (
              <li key={s.key} className={cn("flex items-center gap-3 text-sm", !done && !active && "text-muted-foreground")}>
                <span className={cn("flex size-5 items-center justify-center rounded-full border", done ? "border-success/40 text-success" : active ? "border-primary/50 text-primary" : "border-border")}>
                  {done ? <CheckIcon className="size-3" /> : active ? <Loader2Icon className="size-3 animate-spin" /> : null}
                </span>
                {s.label}
                {s.key === "extracting" && (done || active) && pageCount > 0 && (
                  <span className="font-mono text-xs text-muted-foreground">{pageCount} pages</span>
                )}
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
