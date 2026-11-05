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
  /** Dev-only escape hatch: run Chromium locally instead of in a Daytona sandbox. */
  allowLocalBrowser: () =>
    process.env.NODE_ENV !== "production" && optional("ALLOW_LOCAL_BROWSER") === "true",
};

export function isSupabaseConfigured() {
  return Boolean(optional("NEXT_PUBLIC_SUPABASE_URL") && optional("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}
