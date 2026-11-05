import Link from "next/link";
import type { Metadata } from "next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatusLabel } from "@/components/sessions/status";
import { requireSession, formatDate } from "@/lib/dashboard/queries";

export const metadata: Metadata = { title: "Test history" };

export default async function TestsPage() {
  const { supabase } = await requireSession();
  const [{ data: tests }, { data: websites }] = await Promise.all([
    supabase.from("tests").select("id, title, status, website_id, created_at, completed_at").order("created_at", { ascending: false }).limit(200),
    supabase.from("websites").select("id, domain"),
  ]);
  const domain = new Map((websites ?? []).map((w) => [w.id, w.domain]));
  return (
    <div className="grid gap-6">
      <PageHeader title="Test history" description="Revisit previous tests and reports." />
      {!tests?.length ? (
        <EmptyState title="No tests yet" description="Your test reports will appear here." />
      ) : (
        <Card className="py-0">
          <CardContent className="px-0">
            <Table>
              <TableHeader>
                <TableRow><TableHead className="pl-4">Test</TableHead><TableHead>Website</TableHead><TableHead>Started</TableHead><TableHead className="pr-4 text-right">Status</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((t) => (
                  <TableRow key={t.id} className="relative">
                    <TableCell className="max-w-[360px] truncate pl-4">
                      <Link href={`/dashboard/tests/${t.id}`} className="after:absolute after:inset-0 hover:underline">{t.title}</Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{domain.get(t.website_id)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{formatDate(t.created_at)}</TableCell>
                    <TableCell className="pr-4 text-right"><StatusLabel status={t.status} className="text-xs" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
