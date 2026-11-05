import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { consumePendingIntent, safeNextPath } from "@/lib/auth/intents";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Magic-link callback. Supports both:
 *  - token_hash + type (works when the link is opened in a different browser), and
 *  - PKCE `code` (Supabase's default email template, same browser).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  if (!isSupabaseConfigured()) return NextResponse.redirect(new URL("/login?error=config", origin));

  const supabase = await createClient();
  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }
  if (!ok) return NextResponse.redirect(new URL("/login?error=link", origin));

  // Ensure a profile exists (the DB trigger normally handles this).
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    await createAdminClient()
      .from("profiles")
      .upsert({ id: user.id, email: user.email ?? "" }, { onConflict: "id", ignoreDuplicates: true });
  }

  const intentUrl = await consumePendingIntent(searchParams.get("intent"));
  if (intentUrl) {
    return NextResponse.redirect(new URL(`/dashboard/new?url=${encodeURIComponent(intentUrl)}`, origin));
  }
  return NextResponse.redirect(new URL(safeNextPath(searchParams.get("next")), origin));
}
