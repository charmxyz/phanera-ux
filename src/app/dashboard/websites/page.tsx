import type { Metadata } from "next";
import { PageHeader } from "@/components/dashboard/page-header";
import { WebsiteCard } from "@/components/dashboard/website-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { DiscoveryUrlForm } from "@/components/dashboard/url-form";
import { requireSession } from "@/lib/dashboard/queries";

export const metadata: Metadata = { title: "Websites" };

export default async function WebsitesPage() {
  const { supabase } = await requireSession();
  const [{ data: websites }, { data: tests }] = await Promise.all([
    supabase.from("websites").select("*").order("updated_at", { ascending: false }),
    supabase.from("tests").select("website_id, status, created_at").order("created_at", { ascending: false }),
  ]);
  return (
    <div className="grid gap-6">
      <PageHeader title="Websites" description="Every website you've explored." />
      {!websites?.length ? (
        <EmptyState title="No websites yet" description="Explore a website to get started."><DiscoveryUrlForm /></EmptyState>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {websites.map((w) => {
            const wt = (tests ?? []).filter((t) => t.website_id === w.id);
            return <WebsiteCard key={w.id} website={w} testCount={wt.length} latestTestStatus={wt[0]?.status} />;
          })}
        </div>
      )}
    </div>
  );
}
