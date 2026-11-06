import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SessionEventRow } from "@/types/database";

const TOKEN = /^[A-Za-z0-9_-]{20,64}$/;

/**
 * Loads a shared report by its public token. Uses the service role because viewers aren't
 * signed in, so every query is scoped to the one test the token unlocks.
 */
export const getSharedReport = cache(async (token: string) => {
  await connection();
  if (!TOKEN.test(token)) notFound();
  const db = createAdminClient();
  const { data: test } = await db.from("tests").select("*").eq("share_token", token).maybeSingle();
  if (!test) notFound();

  const [{ data: website }, { data: personas }, { data: sessions }, { data: findings }] = await Promise.all([
    db.from("websites").select("domain, url, title, readiness").eq("id", test.website_id).single(),
    db.from("personas").select("*").eq("test_id", test.id).order("created_at"),
    db.from("sessions").select("*").eq("test_id", test.id).order("created_at"),
    db.from("findings").select("*").eq("test_id", test.id),
  ]);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return {
    test,
    website: website!,
    personas: personas ?? [],
    sessions: sessions ?? [],
    findings: (findings ?? []).sort((a, b) => order[a.severity] - order[b.severity]),
  };
});

/** Recorded steps for the given sessions (all within the shared test), with signed screenshot URLs. */
export async function getSharedEvents(sessionIds: string[]) {
  const db = createAdminClient();
  const { data } = sessionIds.length
    ? await db.from("session_events").select("*").in("session_id", sessionIds).order("step")
    : { data: [] as SessionEventRow[] };
  const events = data ?? [];
  const paths = events.map((e) => e.screenshot_path).filter((p): p is string => Boolean(p));
  const urls: Record<string, string> = {};
  if (paths.length) {
    const { data: signed } = await db.storage.from("evidence").createSignedUrls(paths, 60 * 60);
    for (const d of signed ?? []) if (d.path && d.signedUrl) urls[d.path] = d.signedUrl;
  }
  return { events, urls };
}
