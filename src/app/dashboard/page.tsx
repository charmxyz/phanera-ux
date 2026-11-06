import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { DiscoveryUrlForm } from "@/components/dashboard/url-form";
import { WebsiteCard } from "@/components/dashboard/website-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusLabel } from "@/components/sessions/status";
import { SeverityBadge } from "@/components/findings/severity-badge";
import { requireSession, formatDate } from "@/lib/dashboard/queries";
import { getUsageSummary } from "@/lib/usage/usage";

export default async function DashboardPage() {
  const { supabase, user } = await requireSession();
  const [{ data: websites }, { data: tests }, { data: findings }, usage] = await Promise.all([
    supabase.from("websites").select("*").order("updated_at", { ascending: false }).limit(9),
    supabase.from("tests").select("id, title, status, website_id, created_at").order("created_at", { ascending: false }).limit(50),
    supabase.from("findings").select("id, title, severity, test_id, created_at").order("created_at", { ascending: false }).limit(6),
    getUsageSummary(user.id),
  ]);

  const allTests = tests ?? [];
  const completed = allTests.filter((t) => t.status === "complete" || t.status === "partial").length;

  return (
    <div className="grid gap-8">
      <PageHeader
        title="Your dashboard"
        description="Explore your websites, manage tests, and review findings."
        actions={<Link href="/dashboard/new" className={buttonVariants({ size: "lg" })}><PlusIcon /> New test</Link>}
      />

      {!websites?.length ? (
        <EmptyState title="Start with your website." description="Paste a URL to see where visitors get stuck." seed={user.id}>
          <DiscoveryUrlForm autoFocus />
        </EmptyState>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Completed tests" value={completed} />
            <Stat label="Remaining test runs" value={`${usage.remaining} / ${usage.allowance}`} hint={usage.period === "lifetime" ? `${usage.limits.label} plan, lifetime` : "This month"} />
            <Stat label="Websites" value={websites.length} />
          </div>

          <section className="grid gap-3">
            <h2 className="text-sm font-medium text-muted-foreground">Websites</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {websites.map((w) => {
                const wt = allTests.filter((t) => t.website_id === w.id);
                return <WebsiteCard key={w.id} website={w} testCount={wt.length} latestTestStatus={wt[0]?.status} />;
              })}
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent tests</CardTitle></CardHeader>
              <CardContent className="grid gap-1">
                {allTests.length === 0 && <p className="text-sm text-muted-foreground">No tests yet.</p>}
                {allTests.slice(0, 6).map((t) => (
                  <Link key={t.id} href={`/dashboard/tests/${t.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                    <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                    <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{formatDate(t.created_at)}</span>
                    <StatusLabel status={t.status} className="text-xs" />
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Recent findings</CardTitle></CardHeader>
              <CardContent className="grid gap-1">
                {!findings?.length && <p className="text-sm text-muted-foreground">Findings appear here after a test completes.</p>}
                {findings?.map((f) => (
                  <Link key={f.id} href={`/dashboard/tests/${f.test_id}?tab=findings`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                    <SeverityBadge severity={f.severity} />
                    <span className="min-w-0 flex-1 truncate text-sm">{f.title}</span>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <Card size="sm">
      <CardContent className="grid gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-2xl font-semibold tracking-tight">{value}</span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </CardContent>
    </Card>
  );
}
