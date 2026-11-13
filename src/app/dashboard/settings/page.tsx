import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireSession, formatDate } from "@/lib/dashboard/queries";
import { getUsageSummary } from "@/lib/usage/usage";
import { BillingCard } from "@/components/billing/billing-card";
import { isPaypalConfigured, isStripeConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage({ searchParams }: PageProps<"/dashboard/settings">) {
  const sp = await searchParams;
  const { supabase, user } = await requireSession();
  const [{ data: profile }, usage] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    getUsageSummary(user.id),
  ]);
  const l = usage.limits;
  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Your account and plan." />
      <Card>
        <CardHeader><CardTitle className="text-sm">Account</CardTitle></CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <Row label="Email"><span className="font-mono">{user.email}</span></Row>
          <Row label="Member since"><span className="font-mono">{formatDate(profile?.created_at)}</span></Row>
          <Row label="Sign-in method">Email magic link</Row>
        </CardContent>
      </Card>
      {profile && (
        <BillingCard
          profile={profile}
          plan={usage.plan}
          notice={typeof sp.billing === "string" ? sp.billing : undefined}
          stripeEnabled={isStripeConfigured()}
          paypalEnabled={isPaypalConfigured()}
        />
      )}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Usage</CardTitle>
          <CardDescription>{l.label} plan limits</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-2">
            <div className="flex justify-between"><span>Usability tests used</span><span className="font-mono">{usage.used} / {usage.allowance}{usage.period === "month" ? " this month" : " lifetime"}</span></div>
            <Progress value={usage.allowance ? (usage.used / usage.allowance) * 100 : 0} className="h-1.5" />
          </div>
          <Row label="Personas per test">{l.personasPerTest}</Row>
          <Row label="Pages per website analysis">{l.pagesPerScan}</Row>
          <Row label="Actions per persona">{l.maxActionsPerPersona}</Row>
          <Row label="Time per persona">{l.maxDurationMsPerPersona / 60_000} minutes</Row>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Session</CardTitle><CardDescription>Signing out revokes this session and clears its cookies.</CardDescription></CardHeader>
        <CardContent>
          <form action="/auth/signout" method="post"><Button type="submit" variant="outline">Sign out</Button></form>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0"><span className="text-muted-foreground">{label}</span><span>{children}</span></div>;
}
