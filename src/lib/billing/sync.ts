import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ProfileRow } from "@/types/database";

/** Provider-neutral view of a subscription, written onto the user's profile. */
export type SubscriptionState = {
  provider: "stripe" | "paypal";
  subscriptionId: string;
  /** Our user id, as stored on the subscription when we created it. */
  userId: string | null;
  /** Grants the Startup plan right now. */
  entitled: boolean;
  status: string;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
};

const LIVE = new Set(["active", "trialing", "past_due"]);

/**
 * Applies a subscription's latest state to its owner's profile. Callers always pass state
 * fetched fresh from the provider, so replayed or out-of-order webhooks converge on the truth.
 */
export async function applySubscription(s: SubscriptionState): Promise<"updated" | "ignored"> {
  const db = createAdminClient();
  // The profile that already owns this subscription, else the user who started it.
  let { data: profile } = await db.from("profiles").select("*").eq("subscription_id", s.subscriptionId).maybeSingle();
  if (!profile && s.userId) {
    const { data } = await db.from("profiles").select("*").eq("id", s.userId).maybeSingle();
    // Never let a different, older subscription overwrite one that is currently live,
    // and never touch manually granted (comp) accounts.
    if (data && data.billing_provider !== "comp" && !(data.subscription_id && LIVE.has(data.subscription_status ?? ""))) profile = data;
  }
  if (!profile || profile.billing_provider === "comp") return "ignored";

  const update: Partial<ProfileRow> = {
    plan: s.entitled ? "startup" : "free",
    billing_provider: s.provider,
    subscription_id: s.subscriptionId,
    subscription_status: s.status,
    current_period_end: s.currentPeriodEnd?.toISOString() ?? profile.current_period_end,
    cancel_at_period_end: s.cancelAtPeriodEnd,
    updated_at: new Date().toISOString(),
  };
  if (s.stripeCustomerId) update.stripe_customer_id = s.stripeCustomerId;
  const { error } = await db.from("profiles").update(update).eq("id", profile.id);
  if (error) throw new Error(`Could not update billing for ${profile.id}: ${error.message}`);
  return "updated";
}
