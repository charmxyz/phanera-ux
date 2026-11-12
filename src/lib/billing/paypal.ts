import "server-only";
import { env } from "@/lib/env";
import { applySubscription } from "./sync";

/** New PayPal sign-ups are paused: the button is hidden and checkout refuses. Existing PayPal subscriptions still sync and can cancel. */
export const PAYPAL_CHECKOUT_PAUSED = true;

/** Minimal PayPal REST client (Subscriptions + webhook verification). */
const base = () => (env.paypalLive() ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com");

let cached: { token: string; expires: number } | null = null;
async function accessToken(): Promise<string> {
  if (cached && cached.expires > Date.now() + 60_000) return cached.token;
  const id = env.paypalClientId();
  const secret = env.paypalClientSecret();
  if (!id || !secret) throw new Error("PayPal is not configured.");
  const res = await fetch(`${base()}/v1/oauth2/token`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`PayPal auth failed (${res.status}).`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cached = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return cached.token;
}

async function paypal<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${base()}${path}`, {
    method: init.method ?? "GET",
    headers: { Authorization: `Bearer ${await accessToken()}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) {
    // PayPal's error body names the exact field and issue; log it in full (no secrets in it).
    const text = await res.text();
    let detail = text.slice(0, 500);
    try {
      const j = JSON.parse(text) as { name?: string; message?: string; debug_id?: string; details?: { field?: string; issue?: string; description?: string }[] };
      detail = [j.name, j.message, ...(j.details ?? []).map((d) => `${d.field ?? ""} ${d.issue ?? ""} ${d.description ?? ""}`.trim()), j.debug_id && `debug_id=${j.debug_id}`].filter(Boolean).join(" | ");
    } catch { /* not JSON */ }
    console.error(`[paypal] ${init.method ?? "GET"} ${path} → ${res.status}: ${detail}`);
    throw new Error(`PayPal ${init.method ?? "GET"} ${path} failed (${res.status}): ${detail}`);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

export type PaypalSubscription = {
  id: string;
  status: "APPROVAL_PENDING" | "APPROVED" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
  custom_id?: string;
  billing_info?: { next_billing_time?: string; last_payment?: { time?: string } };
  links?: { href: string; rel: string }[];
};

/** Creates a subscription and returns the PayPal page where the user approves it. */
export async function createPaypalSubscription(input: { userId: string; email: string }) {
  const planId = env.paypalPlanId();
  if (!planId) throw new Error("PayPal is not configured.");
  const app = env.appOrigin();
  const sub = await paypal<PaypalSubscription>("/v1/billing/subscriptions", {
    method: "POST",
    body: {
      plan_id: planId,
      custom_id: input.userId,
      subscriber: { email_address: input.email },
      application_context: {
        brand_name: "Phanera",
        user_action: "SUBSCRIBE_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${app}/dashboard/billing/paypal`,
        // No "#fragment": PayPal's URL validation rejects it with a 400 MALFORMED_REQUEST.
        cancel_url: `${app}/dashboard/settings?billing=cancelled`,
      },
    },
  });
  const approve = sub.links?.find((l) => l.rel === "approve")?.href;
  if (!approve) throw new Error("PayPal did not return an approval link.");
  return approve;
}

export const getPaypalSubscription = (id: string) => paypal<PaypalSubscription>(`/v1/billing/subscriptions/${encodeURIComponent(id)}`);

export async function cancelPaypalSubscription(id: string) {
  await paypal(`/v1/billing/subscriptions/${encodeURIComponent(id)}/cancel`, { method: "POST", body: { reason: "Cancelled from Phanera settings" } });
}

/** Re-reads the subscription from PayPal and writes it to the owner's profile. */
export async function syncPaypalSubscription(id: string, expectUserId?: string) {
  const sub = await getPaypalSubscription(id);
  if (expectUserId && sub.custom_id !== expectUserId) throw new Error("This PayPal subscription belongs to a different account.");
  const last = sub.billing_info?.last_payment?.time;
  // Cancelled subscriptions drop next_billing_time; access then runs a month from the last payment.
  const next = sub.billing_info?.next_billing_time ?? (sub.status === "CANCELLED" && last ? addMonth(last) : undefined);
  const result = await applySubscription({
    provider: "paypal",
    subscriptionId: sub.id,
    userId: sub.custom_id ?? null,
    // A cancelled PayPal subscription keeps access until the end of the paid period
    // (effectivePlan expires it); suspended (failed payment) or expired ends it now.
    entitled: sub.status === "ACTIVE" || sub.status === "CANCELLED",
    status: sub.status.toLowerCase(),
    currentPeriodEnd: next ? new Date(next) : null,
    cancelAtPeriodEnd: sub.status === "CANCELLED",
  });
  return { status: sub.status, result };
}

function addMonth(iso: string) {
  const d = new Date(iso);
  d.setUTCMonth(d.getUTCMonth() + 1);
  return d.toISOString();
}

/** Verifies a webhook with PayPal (postback verification). */
export async function verifyPaypalWebhook(headers: Headers, event: unknown): Promise<boolean> {
  const webhookId = env.paypalWebhookId();
  if (!webhookId) return false;
  const h = (k: string) => headers.get(k) ?? "";
  const out = await paypal<{ verification_status: string }>("/v1/notifications/verify-webhook-signature", {
    method: "POST",
    body: {
      auth_algo: h("paypal-auth-algo"),
      cert_url: h("paypal-cert-url"),
      transmission_id: h("paypal-transmission-id"),
      transmission_sig: h("paypal-transmission-sig"),
      transmission_time: h("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: event,
    },
  });
  return out.verification_status === "SUCCESS";
}
