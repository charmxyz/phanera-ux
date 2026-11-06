"use server";

import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { env, isPaypalConfigured, isStripeConfigured } from "@/lib/env";
import { effectivePlan } from "@/lib/usage/plans";
import { stripe } from "@/lib/billing/stripe";
import { cancelPaypalSubscription, createPaypalSubscription, syncPaypalSubscription } from "@/lib/billing/paypal";

const SETTINGS = "/dashboard/settings";
const back = (state: string) => `${SETTINGS}?billing=${state}#billing`;

async function loadProfile() {
  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(SETTINGS)}`);
  const { data: profile } = await createAdminClient().from("profiles").select("*").eq("id", user.id).single();
  if (!profile) throw new Error("Profile not found.");
  return { user, profile };
}

/** Subscribe with card: Stripe Checkout (promotion codes allowed, so 100%-off codes work). */
export async function startStripeCheckout() {
  if (!isStripeConfigured()) redirect(back("unavailable"));
  const { user, profile } = await loadProfile();
  if (effectivePlan(profile) === "startup" && !profile.cancel_at_period_end) redirect(back("already"));

  const s = stripe();
  let customer = profile.stripe_customer_id;
  if (!customer) {
    customer = (await s.customers.create({ email: user.email ?? profile.email, metadata: { userId: user.id } })).id;
    await createAdminClient().from("profiles").update({ stripe_customer_id: customer }).eq("id", user.id);
  }
  const app = env.appUrl();
  const session = await s.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: user.id,
    line_items: [{ price: env.stripePriceId()!, quantity: 1 }],
    subscription_data: { metadata: { userId: user.id } },
    allow_promotion_codes: true,
    // Lets a 100%-off promotion code complete checkout without entering a card.
    payment_method_collection: "if_required",
    success_url: `${app}/dashboard/billing/stripe?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${app}${back("cancelled")}`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout link.");
  redirect(session.url);
}

/** Stripe's hosted portal: change card, see invoices, cancel. */
export async function openStripePortal() {
  const { profile } = await loadProfile();
  if (!profile.stripe_customer_id || !isStripeConfigured()) redirect(back("unavailable"));
  const portal = await stripe().billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${env.appUrl()}${SETTINGS}#billing` });
  redirect(portal.url);
}

/** Pay with PayPal: creates a PayPal subscription and sends the user to approve it. */
export async function startPaypalCheckout() {
  if (!isPaypalConfigured()) redirect(back("unavailable"));
  const { user, profile } = await loadProfile();
  if (effectivePlan(profile) === "startup" && !profile.cancel_at_period_end) redirect(back("already"));
  const approveUrl = await createPaypalSubscription({ userId: user.id, email: user.email ?? profile.email });
  redirect(approveUrl);
}

/** PayPal has no hosted portal, so cancelling happens here. Access lasts until the period ends. */
export async function cancelPaypal() {
  const { user, profile } = await loadProfile();
  if (profile.billing_provider !== "paypal" || !profile.subscription_id) redirect(back("unavailable"));
  await cancelPaypalSubscription(profile.subscription_id);
  await syncPaypalSubscription(profile.subscription_id, user.id);
  redirect(back("cancelled_sub"));
}
