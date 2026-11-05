import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

const TTL_MS = 60 * 60 * 1000; // matches Supabase's default magic-link expiry

const hash = (token: string) => createHash("sha256").update(token).digest("hex");

/**
 * Stores the submitted URL server-side and returns an opaque state token
 * that travels through the magic-link redirect (PRD §7.7). Only the hash is stored.
 */
export async function createPendingIntent(normalizedUrl: string): Promise<string> {
  const token = randomBytes(24).toString("base64url");
  const db = createAdminClient();
  const { error } = await db.from("pending_auth_intents").insert({
    normalized_url: normalizedUrl,
    state_token_hash: hash(token),
    expires_at: new Date(Date.now() + TTL_MS).toISOString(),
  });
  if (error) throw new Error("Could not save your website. Please try again.");
  // Opportunistic cleanup of expired intents.
  await db.from("pending_auth_intents").delete().lt("expires_at", new Date(Date.now() - TTL_MS).toISOString());
  return token;
}

/** Resolves and consumes an intent. Returns null if missing, expired or already used. */
export async function consumePendingIntent(token: string | null): Promise<string | null> {
  if (!token || token.length > 100) return null;
  const db = createAdminClient();
  const now = new Date().toISOString();
  const { data } = await db
    .from("pending_auth_intents")
    .update({ consumed_at: now })
    .eq("state_token_hash", hash(token))
    .is("consumed_at", null)
    .gt("expires_at", now)
    .select("normalized_url")
    .maybeSingle();
  return data?.normalized_url ?? null;
}

/** Only allow redirects to known in-app paths. */
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;
  const allowed = ["/dashboard"];
  return allowed.some((p) => next === p || next.startsWith(`${p}/`) || next.startsWith(`${p}?`)) ? next : fallback;
}
