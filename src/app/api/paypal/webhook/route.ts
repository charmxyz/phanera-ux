import { NextResponse, type NextRequest } from "next/server";
import { syncPaypalSubscription, verifyPaypalWebhook } from "@/lib/billing/paypal";

type PaypalEvent = { event_type?: string; resource?: { id?: string; billing_agreement_id?: string } };

/** PayPal webhook: activations, renewals, cancellations, failed payments. */
export async function POST(request: NextRequest) {
  let event: PaypalEvent;
  try {
    event = (await request.json()) as PaypalEvent;
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  try {
    if (!(await verifyPaypalWebhook(request.headers, event))) return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  } catch (e) {
    console.error("[paypal] webhook verification failed", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }

  const type = event.event_type ?? "";
  // Subscription events carry the subscription; renewal payments reference it as billing_agreement_id.
  const id = type.startsWith("BILLING.SUBSCRIPTION.") ? event.resource?.id : type.startsWith("PAYMENT.SALE.") ? event.resource?.billing_agreement_id : undefined;
  if (!id) return NextResponse.json({ received: true });
  try {
    await syncPaypalSubscription(id);
  } catch (e) {
    console.error("[paypal] webhook handling failed", type, e);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 }); // PayPal retries
  }
  return NextResponse.json({ received: true });
}
