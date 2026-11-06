import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { stripe, syncStripeSubscription } from "@/lib/billing/stripe";

/** Stripe Checkout returns here; activate straight away instead of waiting for the webhook. */
export async function GET(request: NextRequest) {
  const to = (state: string) => NextResponse.redirect(new URL(`/dashboard/settings?billing=${state}#billing`, request.url));
  const id = request.nextUrl.searchParams.get("session_id");
  const user = await getUser();
  if (!user || !id) return to("error");
  try {
    const session = await stripe().checkout.sessions.retrieve(id);
    if (session.client_reference_id !== user.id) return to("error");
    const sub = session.subscription;
    if (!sub) return to("pending");
    await syncStripeSubscription(typeof sub === "string" ? sub : sub.id);
    return to("success");
  } catch (e) {
    console.error("[stripe] return sync failed", e);
    return to("pending"); // the webhook will still complete it
  }
}
