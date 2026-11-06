"use server";

import { randomBytes } from "node:crypto";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

type Result = { ok: true; url: string | null } | { ok: false; error: string };

const shareUrl = (token: string) => `${env.appUrl()}/r/${token}`;

/** Turns the public, view-only link for a test on or off. Only the test's owner can do this. */
export async function setTestSharing(testId: string, enabled: boolean): Promise<Result> {
  const user = await getUser();
  if (!user) return { ok: false, error: "You need to sign in again." };
  const db = createAdminClient();
  const { data: test } = await db.from("tests").select("id, user_id, status, share_token").eq("id", testId).maybeSingle();
  if (!test || test.user_id !== user.id) return { ok: false, error: "Test not found." };

  if (!enabled) {
    await db.from("tests").update({ share_token: null, shared_at: null }).eq("id", testId);
    return { ok: true, url: null };
  }
  if (test.status === "queued" || test.status === "running" || test.status === "evaluating") {
    return { ok: false, error: "You can share the report once the test has finished." };
  }
  // 144 random bits: not guessable or enumerable. Reuse the current link if one exists.
  const token = test.share_token ?? randomBytes(18).toString("base64url");
  const { error } = await db.from("tests").update({ share_token: token, shared_at: new Date().toISOString() }).eq("id", testId);
  if (error) return { ok: false, error: "Could not create the link. Try again." };
  return { ok: true, url: shareUrl(token) };
}
