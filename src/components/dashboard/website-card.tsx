import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { StatusLabel } from "@/components/sessions/status";
import { formatDate } from "@/lib/dashboard/queries";
import type { WebsiteRow } from "@/types/database";

export function WebsiteCard({ website, testCount, latestTestStatus }: { website: WebsiteRow; testCount: number; latestTestStatus?: string }) {
  return (
    <Link href={`/dashboard/websites/${website.id}`} className="group rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
      <Card size="sm" className="h-full transition-colors group-hover:bg-accent/60">
        <CardContent className="grid gap-3">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- third-party favicon, may 404 */}
            <img src={`https://www.google.com/s2/favicons?domain=${website.domain}&sz=64`} alt="" className="size-5 rounded-sm" />
            <span className="truncate font-mono text-sm">{website.domain}</span>
          </div>
          <p className="line-clamp-2 min-h-10 text-sm text-muted-foreground">{website.description ?? website.title ?? "Not yet analysed"}</p>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>{testCount} {testCount === 1 ? "test" : "tests"} · scanned {formatDate(website.last_scanned_at)}</span>
            {latestTestStatus ? <StatusLabel status={latestTestStatus} className="text-xs" /> : <StatusLabel status={website.discovery_status} className="text-xs" />}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
