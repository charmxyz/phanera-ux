import { NextResponse, type NextRequest } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { syncPaypalSubscription } from "@/lib/billing/paypal";

/** PayPal sends the user back here after they approve the subscription. */
export async function GET(request: NextRequest) {
  const to = (state: string) => NextResponse.redirect(new URL(`/dashboard/settings?billing=${state}#billing`, request.url));
  const id = request.nextUrl.searchParams.get("subscription_id");
  const user = await getUser();
  if (!user || !id) return to("error");
  try {
    // Verifies with PayPal that this subscription is real and belongs to this user before granting anything.
    const { status } = await syncPaypalSubscription(id, user.id);
    return to(status === "ACTIVE" ? "success" : "pending");
  } catch (e) {
    console.error("[paypal] return sync failed", e);
    return to("error");
  }
}
