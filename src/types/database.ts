// Hand-maintained to mirror supabase/migrations. Regenerate with
// `supabase gen types typescript --project-id <id> > src/types/database.ts` once linked.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type Table<Row, Required extends keyof Row = never> = {
  Row: Row;
  Insert: Partial<Row> & Pick<Row, Required>;
  Update: Partial<Row>;
  Relationships: [];
};

export type DiscoveryStatus =
  | "queued" | "fetching" | "discovering" | "extracting" | "analysing" | "complete" | "partial" | "failed";
export type TestStatus = "queued" | "running" | "evaluating" | "complete" | "partial" | "failed";
export type SessionStatus = "queued" | "running" | "completed" | "failed";
export type Outcome = "success" | "partial_success" | "failed" | "abandoned" | "blocked" | "inconclusive";
export type Severity = "critical" | "high" | "medium" | "low";
export type Confidence = "confirmed" | "likely" | "hypothesis";

export type ProfileRow = {
  id: string;
  email: string;
  plan: "free" | "startup";
  billing_provider: "stripe" | "paypal" | "comp" | null;
  stripe_customer_id: string | null;
  subscription_id: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  created_at: string;
  updated_at: string;
};

export type WebsiteRow = {
  id: string;
  user_id: string;
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  favicon_url: string | null;
  discovery_status: DiscoveryStatus;
  discovery_error: string | null;
  summary: Json | null;
  readiness: Json | null;
  suggested_goals: Json | null;
  suggested_personas: Json | null;
  last_scanned_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WebsitePageRow = {
  id: string;
  website_id: string;
  user_id: string;
  url: string;
  title: string | null;
  page_type: string | null;
  content_summary: string | null;
  crawl_status: string;
  word_count: number | null;
  created_at: string;
};

export type TestRow = {
  id: string;
  user_id: string;
  website_id: string;
  title: string;
  goal: string;
  status: TestStatus;
  configuration: Json;
  summary: Json | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  share_token: string | null;
  shared_at: string | null;
  cancel_requested_at: string | null;
  heartbeat_at: string | null;
  attempts: number;
};

export type PersonaRow = {
  id: string;
  test_id: string;
  user_id: string;
  name: string;
  role: string;
  goal: string;
  configuration: Json;
  created_at: string;
};

export type SessionRow = {
  id: string;
  test_id: string;
  persona_id: string;
  user_id: string;
  status: SessionStatus;
  outcome: Outcome | null;
  duration_ms: number | null;
  action_count: number;
  current_activity: string | null;
  agent_summary: string | null;
  evaluation: Json | null;
  error: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
};

export type SessionEventRow = {
  id: string;
  session_id: string;
  user_id: string;
  step: number;
  timestamp: string;
  action: string;
  target: string | null;
  url: string | null;
  result: string | null;
  reasoning: string | null;
  /** Added in 20261105000000; undefined on databases that haven't applied it. */
  observation?: string | null;
  screenshot_path: string | null;
  error: string | null;
};

export type FindingRow = {
  id: string;
  test_id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  severity: Severity;
  confidence: Confidence;
  impacted_personas: string[];
  recommendation: string;
  evidence: Json;
  page_url: string | null;
  created_at: string;
};

export type UsageRow = {
  id: string;
  user_id: string;
  test_id: string | null;
  website_id: string | null;
  usage_type: "test_run" | "discovery_scan";
  quantity: number;
  created_at: string;
};

export type PendingIntentRow = {
  id: string;
  normalized_url: string;
  state_token_hash: string;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow, "id" | "email">;
      websites: Table<WebsiteRow, "user_id" | "url" | "domain">;
      website_pages: Table<WebsitePageRow, "website_id" | "user_id" | "url">;
      tests: Table<TestRow, "user_id" | "website_id" | "title" | "goal">;
      personas: Table<PersonaRow, "test_id" | "user_id" | "name" | "role" | "goal">;
      sessions: Table<SessionRow, "test_id" | "persona_id" | "user_id">;
      session_events: Table<SessionEventRow, "session_id" | "user_id" | "step" | "action">;
      findings: Table<
        FindingRow,
        "test_id" | "user_id" | "title" | "description" | "category" | "severity" | "confidence" | "recommendation"
      >;
      usage: Table<UsageRow, "user_id" | "usage_type">;
      pending_auth_intents: Table<PendingIntentRow, "normalized_url" | "state_token_hash" | "expires_at">;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};
