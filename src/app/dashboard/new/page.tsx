import Link from "next/link";
import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/dashboard/page-header";
import { DiscoveryUrlForm } from "@/components/dashboard/url-form";
import { DiscoveryProgress } from "@/components/dashboard/discovery-progress";
import { TestWizard } from "@/components/dashboard/test-wizard";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { ACTIVE_DISCOVERY, StatusLabel } from "@/components/sessions/status";
import { requireSession } from "@/lib/dashboard/queries";
import { getUsageSummary } from "@/lib/usage/usage";
import { normalizeUrl } from "@/lib/validation/url";
import type { Persona, WebsiteAnalysis } from "@/lib/claude/schemas";

export const metadata: Metadata = { title: "New test" };

export default async function NewTestPage({ searchParams }: PageProps<"/dashboard/new">) {
  const sp = await searchParams;
  const { supabase, user } = await requireSession();
  const usage = await getUsageSummary(user.id);
  const websiteId = typeof sp.website === "string" ? sp.website : null;
  const urlParam = typeof sp.url === "string" ? sp.url : null;

  // ---- A website was selected: show discovery progress or the test wizard.
  if (websiteId) {
    const { data: website } = await supabase.from("websites").select("*").eq("id", websiteId).maybeSingle();
    if (website) {
      const { count } = await supabase.from("website_pages").select("id", { count: "exact", head: true }).eq("website_id", website.id);
      const active = ACTIVE_DISCOVERY.includes(website.discovery_status);
      const summary = website.summary as WebsiteAnalysis | null;
      return (
        <div className="grid gap-6">
          <AutoRefresh active={active} />
          <PageHeader title="New usability test" description="Review the website, choose a user task and AI personas, then start the test." />
          {active && <DiscoveryProgress status={website.discovery_status} domain={website.domain} pageCount={count ?? 0} />}
          {website.discovery_status === "failed" && (
            <Card>
              <CardHeader>
                <CardTitle>Website analysis failed</CardTitle>
                <CardDescription>{website.discovery_error ?? "We couldn't explore this website."}</CardDescription>
              </CardHeader>
              <CardContent><DiscoveryUrlForm defaultUrl={website.url} cta="Try again" /></CardContent>
            </Card>
          )}
          {!active && summary && (
            <>
              {website.discovery_status === "partial" && (
                <Alert>
                  <AlertTitle>Partial website analysis</AlertTitle>
                  <AlertDescription>{website.discovery_error ?? "Some pages couldn't be read. Results are based on the pages we could access."}</AlertDescription>
                </Alert>
              )}
              <TestWizard
                website={{
                  id: website.id,
                  url: website.url,
                  domain: website.domain,
                  name: summary.website_name,
                  description: summary.product_description,
                  type: summary.website_type,
                  pageCount: count ?? 0,
                }}
                suggestedGoals={(website.suggested_goals as string[] | null) ?? []}
                suggestedPersonas={(website.suggested_personas as Persona[] | null) ?? []}
                limits={{
                  personasPerTest: usage.limits.personasPerTest,
                  pagesPerScan: usage.limits.pagesPerScan,
                  maxActionsPerPersona: usage.limits.maxActionsPerPersona,
                  maxDurationMin: usage.limits.maxDurationMsPerPersona / 60_000,
                  planLabel: usage.limits.label,
                }}
                usage={{ remaining: usage.remaining, allowance: usage.allowance, period: usage.period }}
              />
            </>
          )}
          {!active && !summary && website.discovery_status !== "failed" && (
            <Card><CardContent className="grid gap-3"><p className="text-sm text-muted-foreground">This website needs a fresh analysis before testing.</p><DiscoveryUrlForm defaultUrl={website.url} cta="Scan website" /></CardContent></Card>
          )}
        </div>
      );
    }
  }

  // ---- No website yet: confirm a URL (prefilled after the magic-link flow).
  const prefill = urlParam ? normalizeUrl(urlParam) : null;
  const { data: websites } = await supabase.from("websites").select("id, domain, discovery_status, updated_at").order("updated_at", { ascending: false }).limit(10);

  return (
    <div className="grid gap-6">
      <PageHeader title="New test" description="Start by confirming the website you'd like to explore." />
      <Card>
        <CardHeader>
          <CardTitle>{prefill?.ok ? "Confirm your website" : "Website"}</CardTitle>
          <CardDescription>
            Phanera will read up to {usage.limits.pagesPerScan} public pages to understand your product. Discovery doesn&apos;t use a test run.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DiscoveryUrlForm defaultUrl={prefill?.ok ? prefill.url : ""} cta={prefill?.ok ? "Analyse website" : "Explore website"} autoFocus={!prefill?.ok} />
        </CardContent>
      </Card>
      {websites && websites.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Or choose a website you&apos;ve already explored</CardTitle></CardHeader>
          <CardContent className="grid gap-1">
            {websites.map((w) => (
              <Link key={w.id} href={`/dashboard/new?website=${w.id}`} className="flex items-center justify-between rounded-md px-2 py-2 hover:bg-accent">
                <span className="font-mono text-sm">{w.domain}</span>
                <StatusLabel status={w.discovery_status} className="text-xs" />
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
