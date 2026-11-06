import "server-only";

/**
 * Server-side environment access. Never import this from a client component —
 * the `server-only` import makes that a build error.
 */
function optional(name: string): string | undefined {
  const v = process.env[name];
  return v && v.length > 0 ? v : undefined;
}

function required(name: string): string {
  const v = optional(name);
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

export const env = {
  appUrl: () => optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000",
  /** Clean origin of the app URL (tolerates a trailing slash, spaces or a missing scheme). */
  appOrigin: () => {
    const raw = (optional("NEXT_PUBLIC_APP_URL") ?? "http://localhost:3000").trim();
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  },
  supabaseUrl: () => required("NEXT_PUBLIC_SUPABASE_URL"),
  supabaseAnonKey: () => required("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  supabaseServiceRoleKey: () => required("SUPABASE_SERVICE_ROLE_KEY"),
  anthropicModel: () => optional("ANTHROPIC_MODEL") ?? "claude-opus-5-5",
  /** Cheaper model used for the high-volume per-step browser agent. */
  anthropicAgentModel: () =>
    optional("ANTHROPIC_AGENT_MODEL") ?? optional("ANTHROPIC_MODEL") ?? "claude-opus-5-5",
  daytonaApiKey: () => optional("DAYTONA_API_KEY"),
  daytonaApiUrl: () => optional("DAYTONA_API_URL"),
  triggerSecretKey: () => optional("TRIGGER_SECRET_KEY"),
  stripeSecretKey: () => optional("STRIPE_SECRET_KEY"),
  stripeWebhookSecret: () => optional("STRIPE_WEBHOOK_SECRET"),
  stripePriceId: () => optional("STRIPE_PRICE_ID"),
  paypalClientId: () => optional("PAYPAL_CLIENT_ID"),
  paypalClientSecret: () => optional("PAYPAL_CLIENT_SECRET"),
  paypalPlanId: () => optional("PAYPAL_PLAN_ID"),
  paypalWebhookId: () => optional("PAYPAL_WEBHOOK_ID"),
  /** "live" for real payments; anything else uses the PayPal sandbox. */
  paypalLive: () => optional("PAYPAL_ENV") === "live",
  /** Dev-only escape hatch: run Chromium locally instead of in a Daytona sandbox. */
  allowLocalBrowser: () =>
    process.env.NODE_ENV !== "production" && optional("ALLOW_LOCAL_BROWSER") === "true",
};

export function isStripeConfigured() {
  return Boolean(env.stripeSecretKey() && env.stripePriceId());
}

export function isPaypalConfigured() {
  return Boolean(env.paypalClientId() && env.paypalClientSecret() && env.paypalPlanId());
}

export function isSupabaseConfigured() {
  return Boolean(optional("NEXT_PUBLIC_SUPABASE_URL") && optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}
