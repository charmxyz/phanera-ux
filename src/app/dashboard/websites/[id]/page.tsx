import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PlusIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/dashboard/page-header";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { DiscoveryProgress } from "@/components/dashboard/discovery-progress";
import { RescanButton } from "@/components/dashboard/rescan-button";
import { MeasuredTable } from "@/components/dashboard/measured-table";
import { ACTIVE_DISCOVERY, StatusLabel } from "@/components/sessions/status";
import { requireSession, formatDate } from "@/lib/dashboard/queries";
import type { WebsiteAnalysis } from "@/lib/claude/schemas";
import type { MeasuredReadiness } from "@/lib/discovery/crawl";

export const metadata: Metadata = { title: "Website" };

export default async function WebsitePage({ params }: PageProps<"/dashboard/websites/[id]">) {
  const { id } = await params;
  const { supabase } = await requireSession();
  const { data: website } = await supabase.from("websites").select("*").eq("id", id).maybeSingle();
  if (!website) notFound();
  const [{ data: pages }, { data: tests }] = await Promise.all([
    supabase.from("website_pages").select("*").eq("website_id", id).order("created_at"),
    supabase.from("tests").select("id, title, status, created_at").eq("website_id", id).order("created_at", { ascending: false }),
  ]);
  const summary = website.summary as WebsiteAnalysis | null;
  const measured = (website.readiness as { measured?: MeasuredReadiness } | null)?.measured;
  const active = ACTIVE_DISCOVERY.includes(website.discovery_status);

  return (
    <div className="grid gap-6">
      <AutoRefresh active={active} />
      <PageHeader
        eyebrow={<span className="font-mono">{website.url}</span>}
        title={summary?.website_name ?? website.title ?? website.domain}
        description={`Last scanned ${formatDate(website.last_scanned_at)}`}
        actions={
          <>
            <RescanButton url={website.url} disabled={active} />
            <Link href={`/dashboard/new?website=${website.id}`} className={buttonVariants()}><PlusIcon /> New test</Link>
          </>
        }
      />
      {active && <DiscoveryProgress status={website.discovery_status} domain={website.domain} pageCount={pages?.length ?? 0} />}
      {website.discovery_error && !active && <p className="text-sm text-destructive">{website.discovery_error}</p>}

      {summary && (
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2"><Badge variant="secondary">{summary.website_type}</Badge></div>
              <CardTitle className="mt-2 text-base font-normal leading-relaxed">{summary.product_description}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <Field label="Main audience">{summary.main_audience}</Field>
              <Field label="Value proposition">{summary.value_proposition}</Field>
              <Field label="Main navigation">{summary.main_navigation.join(" · ")}</Field>
              <Field label="Likely audiences">{summary.likely_audiences.join(", ")}</Field>
              <Field label="Suggested goals"><ul className="list-disc pl-4">{summary.suggested_goals.map((g) => <li key={g}>{g}</li>)}</ul></Field>
              <Field label="Content gaps"><ul className="list-disc pl-4">{summary.content_gaps.map((g) => <li key={g}>{g}</li>)}</ul></Field>
              <Field label="Accessibility observations"><ul className="list-disc pl-4">{summary.accessibility_observations.map((g) => <li key={g}>{g}</li>)}</ul></Field>
              <Field label="Important pages">
                <ul className="grid gap-1">{summary.important_pages.map((p) => <li key={p.url}><span className="font-mono text-xs">{p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}</span> <span className="text-muted-foreground">— {p.reason}</span></li>)}</ul>
              </Field>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Tests</CardTitle></CardHeader>
            <CardContent className="grid gap-1">
              {!tests?.length && <p className="text-sm text-muted-foreground">No tests yet.</p>}
              {tests?.map((t) => (
                <Link key={t.id} href={`/dashboard/tests/${t.id}`} className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-accent">
                  <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
                  <StatusLabel status={t.status} className="text-xs" />
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader><CardTitle className="text-sm">Discovered pages</CardTitle><CardDescription>{pages?.length ?? 0} pages</CardDescription></CardHeader>
          <CardContent>
            <Table>
              <TableHeader><TableRow><TableHead>Page</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Words</TableHead></TableRow></TableHeader>
              <TableBody>
                {pages?.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="max-w-[320px]">
                      <p className="truncate">{p.title ?? p.url}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{p.url.replace(/^https?:\/\/[^/]+/, "") || "/"}</p>
                    </TableCell>
                    <TableCell><span className="text-xs text-muted-foreground">{p.page_type ?? "—"}</span></TableCell>
                    <TableCell className="text-right font-mono text-xs">{p.word_count ?? "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {measured && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Agent readiness (measured)</CardTitle></CardHeader>
            <CardContent><MeasuredTable m={measured} /></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="grid content-start gap-1"><span className="text-xs text-muted-foreground">{label}</span><div>{children}</div></div>;
}
