import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { env } from "@/lib/env";
import { stripe, syncStripeSubscription } from "@/lib/billing/stripe";

/** Stripe webhook: keeps each profile's plan in step with its subscription. */
export async function POST(request: NextRequest) {
  const secret = env.stripeWebhookSecret();
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return NextResponse.json({ error: "Not configured" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const sub = event.data.object.subscription;
        if (sub) await syncStripeSubscription(typeof sub === "string" ? sub : sub.id);
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
      case "customer.subscription.paused":
      case "customer.subscription.resumed":
        await syncStripeSubscription(event.data.object.id);
        break;
    }
  } catch (e) {
    console.error("[stripe] webhook handling failed", event.type, e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 }); // Stripe retries
  }
  return NextResponse.json({ received: true });
}
