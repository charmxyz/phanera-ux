import "server-only";
import { isSupabaseConfigured } from "@/lib/env";
import { getUser } from "@/lib/supabase/server";

/** Safe on public pages: returns null when auth isn't configured. */
export async function getOptionalUser() {
  if (!isSupabaseConfigured()) return null;
  try {
    return await getUser();
  } catch {
    return null;
  }
}
