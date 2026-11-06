import { CheckIcon, CreditCardIcon, LockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutoRefresh } from "@/components/dashboard/auto-refresh";
import { SubmitButton } from "./submit-button";
import { startStripeCheckout, startPaypalCheckout, openStripePortal, cancelPaypal } from "@/app/actions/billing";
import { PLAN_LIMITS, STARTUP_PRICE, type PlanId } from "@/lib/usage/plans";
import { formatDate } from "@/lib/dashboard/queries";
import type { ProfileRow } from "@/types/database";

const NOTICE: Record<string, { text: string; tone?: "destructive" }> = {
  success: { text: "You're on the Startup plan. Thanks for subscribing!" },
  pending: { text: "Payment received. Your plan activates as soon as the provider confirms it, usually within a minute." },
  cancelled: { text: "Checkout was cancelled. Nothing was charged." },
  cancelled_sub: { text: "Your subscription is cancelled. You keep Startup until the end of the paid period." },
  already: { text: "You already have an active Startup subscription." },
  unavailable: { text: "That payment option isn't available right now.", tone: "destructive" },
  error: { text: "We couldn't confirm that payment. If you were charged, it will activate shortly; otherwise please try again.", tone: "destructive" },
};

const s = PLAN_LIMITS.startup;
const FEATURES = [
  `${s.monthlyTestRuns} test runs every month`,
  `Up to ${s.personasPerTest} personas per test`,
  `${s.pagesPerScan} pages per website scan`,
  `${s.maxActionsPerPersona} actions and ${s.maxDurationMsPerPersona / 60_000} minutes per persona`,
  "Screenshots of every step",
];

export function BillingCard({
  profile, plan, notice, stripeEnabled, paypalEnabled,
}: {
  profile: ProfileRow; plan: PlanId; notice?: string; stripeEnabled: boolean; paypalEnabled: boolean;
}) {
  const paid = plan === "startup";
  const n = notice ? NOTICE[notice] : undefined;
  const ending = profile.cancel_at_period_end;
  const canBuy = (!paid || ending) && profile.billing_provider !== "comp";

  return (
    <Card id="billing" className="scroll-mt-6 gap-0 py-0">
      {/* Waiting on the provider's confirmation: refresh until the plan flips. */}
      <AutoRefresh active={notice === "pending" && !paid} intervalMs={4000} />
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4">
        <div>
          <p className="font-medium">Plan &amp; billing</p>
          <p className="text-xs text-muted-foreground">{paid ? statusLine(profile) : "You're on the Free plan."}</p>
        </div>
        <span className={paid ? "rounded-md bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground" : "rounded-md border border-border px-2 py-0.5 text-xs"}>
          {paid ? "Startup" : "Free"}
        </span>
      </div>

      {n && (
        <div className="px-5 pt-4">
          <Alert variant={n.tone === "destructive" ? "destructive" : "default"}><AlertDescription>{n.text}</AlertDescription></Alert>
        </div>
      )}

      {paid && profile.billing_provider !== "comp" && (
        <div className="flex flex-wrap items-center gap-3 px-5 py-4">
          {profile.billing_provider === "stripe" && stripeEnabled && (
            <form action={openStripePortal}>
              <SubmitButton className="border border-border bg-card hover:bg-accent"><CreditCardIcon className="size-4" />Manage billing &amp; invoices</SubmitButton>
            </form>
          )}
          {profile.billing_provider === "paypal" && !ending && (
            <form action={cancelPaypal}>
              <SubmitButton confirm="Cancel your PayPal subscription? You keep Startup until the end of the paid period." className="border border-border bg-card hover:bg-accent">
                Cancel subscription
              </SubmitButton>
            </form>
          )}
          {profile.billing_provider === "paypal" && (
            <p className="text-xs text-muted-foreground">Receipts are in your PayPal account.</p>
          )}
        </div>
      )}

      {canBuy && (
        <div className="grid gap-5 px-5 py-5 md:grid-cols-[minmax(0,1fr)_minmax(0,300px)] md:items-center">
          <div className="grid gap-3">
            <p>
              <span className="text-2xl font-semibold tracking-tight">{STARTUP_PRICE.label}</span>
              <span className="text-muted-foreground"> / month · Startup</span>
            </p>
            <ul className="grid gap-1.5 text-sm">
              {FEATURES.map((f) => (
                <li key={f} className="flex gap-2"><CheckIcon className="mt-0.5 size-4 shrink-0 text-success" />{f}</li>
              ))}
            </ul>
          </div>
          {stripeEnabled || paypalEnabled ? (
            <div className="grid gap-2.5">
              {stripeEnabled && (
                <form action={startStripeCheckout} className="grid">
                  <SubmitButton className="bg-primary text-primary-foreground hover:bg-primary/90"><CreditCardIcon className="size-4" />{ending ? "Resubscribe" : "Subscribe"} with card</SubmitButton>
                </form>
              )}
              {paypalEnabled && (
                <form action={startPaypalCheckout} className="grid">
                  <SubmitButton className="bg-[#ffc439] text-[#111] hover:bg-[#f2ba36]">
                    Pay with <span className="font-bold italic"><span className="text-[#003087]">Pay</span><span className="text-[#009cde]">Pal</span></span>
                  </SubmitButton>
                </form>
              )}
              <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <LockIcon className="size-3" />Billed monthly. Cancel anytime.{stripeEnabled && " Promo codes at card checkout."}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Paid plans are coming soon.</p>
          )}
        </div>
      )}
    </Card>
  );
}

function statusLine(p: ProfileRow) {
  if (p.billing_provider === "comp") return "Complimentary access.";
  const via = p.billing_provider === "paypal" ? "PayPal" : "card";
  const date = p.current_period_end ? formatDate(p.current_period_end).split(",")[0] : null;
  if (p.cancel_at_period_end) return date ? `Cancelled. Access until ${date}.` : "Cancelled.";
  if (p.subscription_status === "past_due") return `Payment failed. Update your ${via} details to keep access.`;
  return `${STARTUP_PRICE.label}/month via ${via}${date ? ` · renews ${date}` : ""}.`;
}
