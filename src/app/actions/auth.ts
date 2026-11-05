"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { createClient, getUser } from "@/lib/supabase/server";
import { createPendingIntent, safeNextPath } from "@/lib/auth/intents";
import { normalizeUrl } from "@/lib/validation/url";
import { isSupabaseConfigured } from "@/lib/env";

export type ExploreResult =
  | { status: "authenticated"; redirectTo: string }
  | { status: "needs_auth"; intent: string; url: string }
  | { status: "error"; error: string };

/** Homepage "Explore" — never starts a scan; only routes the user (PRD §6.3). */
export async function startExplore(rawUrl: string): Promise<ExploreResult> {
  const n = normalizeUrl(rawUrl);
  if (!n.ok) return { status: "error", error: n.error };
  if (!isSupabaseConfigured()) return { status: "error", error: "Authentication isn't configured yet." };

  const user = await getUser();
  if (user) return { status: "authenticated", redirectTo: `/dashboard/new?url=${encodeURIComponent(n.url)}` };
  try {
    const intent = await createPendingIntent(n.url);
    return { status: "needs_auth", intent, url: n.url };
  } catch (e) {
    return { status: "error", error: e instanceof Error ? e.message : "Something went wrong." };
  }
}

// Simple per-instance throttle in addition to Supabase Auth's own rate limits.
const recent = new Map<string, number>();
const COOLDOWN_MS = 45_000;

const MagicLinkInput = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  intent: z.string().max(100).optional(),
  next: z.string().max(300).optional(),
});

export type MagicLinkResult = { ok: true } | { ok: false; error: string; retryAfter?: number };

export async function sendMagicLink(input: z.input<typeof MagicLinkInput>): Promise<MagicLinkResult> {
  const parsed = MagicLinkInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Enter a valid email address." };
  if (!isSupabaseConfigured()) return { ok: false, error: "Authentication isn't configured yet." };
  const { email, intent, next } = parsed.data;

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  for (const key of [`e:${email}`, `i:${ip}`]) {
    const last = recent.get(key);
    if (last && now - last < COOLDOWN_MS) {
      return { ok: false, error: "Please wait a moment before requesting another link.", retryAfter: Math.ceil((COOLDOWN_MS - (now - last)) / 1000) };
    }
  }
  recent.set(`e:${email}`, now);
  recent.set(`i:${ip}`, now);
  if (recent.size > 5000) recent.clear();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const callback = new URL("/auth/callback", appUrl);
  if (intent) callback.searchParams.set("intent", intent);
  else callback.searchParams.set("next", safeNextPath(next));

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: callback.toString(), shouldCreateUser: true },
  });

  // Never reveal whether the email has an account. Only surface throttling.
  if (error && (error.status === 429 || /rate limit/i.test(error.message))) {
    return { ok: false, error: "Too many sign-in attempts. Please try again in a minute.", retryAfter: 60 };
  }
  if (error) console.error("[auth] signInWithOtp failed", error.message);
  return { ok: true };
}
