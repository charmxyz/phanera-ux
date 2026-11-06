import "server-only";
import Stripe from "stripe";
import { env } from "@/lib/env";
import { applySubscription } from "./sync";

let client: Stripe | null = null;
export function stripe(): Stripe {
  const key = env.stripeSecretKey();
  if (!key) throw new Error("Stripe is not configured.");
  client ??= new Stripe(key);
  return client;
}

/** Stripe statuses that grant access. past_due keeps access while Stripe retries the card. */
const ENTITLED = new Set(["active", "trialing", "past_due"]);

/** Re-reads the subscription from Stripe and writes it to the owner's profile. */
export async function syncStripeSubscription(subscriptionId: string) {
  const sub = await stripe().subscriptions.retrieve(subscriptionId);
  // Since API 2025-03-31 the billing period lives on each subscription item.
  const periodEnd = Math.max(0, ...sub.items.data.map((i) => i.current_period_end ?? 0));
  return applySubscription({
    provider: "stripe",
    subscriptionId: sub.id,
    userId: sub.metadata?.userId ?? null,
    entitled: ENTITLED.has(sub.status),
    status: sub.status,
    currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end || sub.cancel_at != null,
    stripeCustomerId: typeof sub.customer === "string" ? sub.customer : sub.customer.id,
  });
}
