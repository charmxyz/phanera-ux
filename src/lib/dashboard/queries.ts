import "server-only";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Request-scoped, RLS-enforced data access for dashboard pages. */
export async function requireSession() {
  await connection(); // dashboard data is always request-time
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function getTestBundle(testId: string) {
  const { supabase } = await requireSession();
  // RLS returns nothing for other users' tests → 404 (PRD Test J).
  const { data: test } = await supabase.from("tests").select("*").eq("id", testId).maybeSingle();
  if (!test) notFound();
  const [{ data: website }, { data: personas }, { data: sessions }, { data: findings }] = await Promise.all([
    supabase.from("websites").select("*").eq("id", test.website_id).single(),
    supabase.from("personas").select("*").eq("test_id", testId).order("created_at"),
    supabase.from("sessions").select("*").eq("test_id", testId).order("created_at"),
    supabase.from("findings").select("*").eq("test_id", testId),
  ]);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return {
    test,
    website: website!,
    personas: personas ?? [],
    sessions: sessions ?? [],
    findings: (findings ?? []).sort((a, b) => order[a.severity] - order[b.severity]),
  };
}

export async function signedScreenshotUrls(paths: string[]) {
  if (paths.length === 0) return {} as Record<string, string>;
  const { supabase } = await requireSession();
  const { data } = await supabase.storage.from("evidence").createSignedUrls(paths, 60 * 60);
  const out: Record<string, string> = {};
  for (const d of data ?? []) if (d.path && d.signedUrl) out[d.path] = d.signedUrl;
  return out;
}

export function formatDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

export function formatDuration(ms: number | null | undefined) {
  if (ms == null) return "—";
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`;
}
