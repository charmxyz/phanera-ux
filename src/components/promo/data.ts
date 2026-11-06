/** Sample data for the promo slides: a usability test of the fictional Acme website. */
import type { Persona } from "@/lib/claude/schemas";
import type { FindingRow, PersonaRow, SessionEventRow, SessionRow, TestRow } from "@/types/database";

export const DOMAIN = "acme.dev";
export const TASK = "Can a potential customer find the pricing page and understand which plan fits their team?";
const T0 = Date.parse("2026-11-06T10:00:00Z");

export const PERSONAS: Persona[] = [
  { name: "Priya", role: "Head of Operations", kind: "human", context: "Evaluating tools for a 40-person team.", goal: "Needs a clear price and plan comparison to take to her CEO.", device: "desktop", behaviour: "Skims headings, then reads pricing tables closely.", patience: "medium", success_criteria: "A plan and price she can quote without guessing." },
  { name: "Tom", role: "Startup founder", kind: "human", context: "Busy, comparing three analytics tools this week.", goal: "Wants to start a free trial in under a minute.", device: "desktop", behaviour: "Clicks the first obvious button, ignores long copy.", patience: "low", success_criteria: "A trial started without talking to sales." },
  { name: "Atlas", role: "AI research assistant", kind: "ai_agent", context: "Answering a user's question about Acme.", goal: "Returning an accurate, sourced summary of plans and prices.", device: "desktop", behaviour: "Reads page structure and text, not visuals.", patience: "high", success_criteria: "Every plan and price attributed to a page." },
  { name: "Maya", role: "Data analyst", kind: "human", context: "Checking whether Acme fits their data stack.", goal: "Needs integration and export details before recommending it.", device: "desktop", behaviour: "Goes straight to docs and FAQs.", patience: "high", success_criteria: "Clear answers on integrations and limits." },
];

export const PERSONA_ROWS = PERSONAS.slice(0, 3).map((p, i) => ({
  id: `p${i}`, test_id: "t", user_id: "u", name: p.name, role: p.role, goal: p.goal, configuration: p, created_at: new Date(T0).toISOString(),
})) as unknown as PersonaRow[];

const shot = (k: string) => k; // storage path key → mapped to a public URL below
export const SHOT_URLS: Record<string, string> = {
  home: "/promo/shots/home.jpg",
  "home-scrolled": "/promo/shots/home-scrolled.jpg",
  pricing: "/promo/shots/pricing.jpg",
};

const evaluation = (outcome: string, summary: string, key_points: string[], observations: { step: number | null; issue: string; is_website_issue: boolean; directly_observed: boolean }[]) =>
  ({ outcome, summary, key_points, rationale: "The pricing page shows three plans side by side, but the trial button gave no visible response.", cause: "none", observations });

export const SESSIONS = [
  {
    id: "s0", persona_id: "p0", status: "completed", outcome: "success", duration_ms: 74000, action_count: 3, current_activity: null, error: null,
    agent_summary: "Pricing is in the main navigation. Growth is $49 / month for 5 projects and 1M events. Enterprise says 'Contact sales' with no price. Gaps: annual pricing isn't shown.",
    started_at: new Date(T0).toISOString(),
    evaluation: evaluation("success", "Priya found the Growth plan price in two steps from the homepage.", ["Pricing link is in the main navigation", "Plans are compared side by side", "Annual pricing isn't shown"], [
      { step: 2, issue: "Annual pricing isn't shown, so the yearly cost has to be calculated by hand.", is_website_issue: true, directly_observed: true },
    ]),
  },
  {
    id: "s1", persona_id: "p1", status: "completed", outcome: "partial_success", duration_ms: 52000, action_count: 4, current_activity: null, error: null,
    agent_summary: "Found pricing quickly. Clicked 'Start free trial' twice; nothing visibly changed.",
    started_at: new Date(T0).toISOString(),
    evaluation: evaluation("partial_success", "Tom reached pricing fast, but the free trial button didn't respond.", ["Pricing reached in one click", "Trial button gave no feedback", "Left without starting a trial"], [
      { step: 3, issue: "'Start free trial' gave no visible response after clicking.", is_website_issue: true, directly_observed: true },
    ]),
  },
  {
    id: "s2", persona_id: "p2", status: "completed", outcome: "success", duration_ms: 41000, action_count: 2, current_activity: null, error: null,
    agent_summary: "Plans: Starter $0, Growth $49 / month, Enterprise contact sales. Source: /pricing.",
    started_at: new Date(T0).toISOString(),
    evaluation: evaluation("success", "Atlas extracted every plan and price from the pricing page.", ["All three plans found on /pricing", "No structured data for prices"], [
      { step: 2, issue: "Prices aren't marked up as structured data, so assistants rely on page text.", is_website_issue: true, directly_observed: false },
    ]),
  },
] as unknown as SessionRow[];

const ev = (sid: string, step: number, action: string, url: string, path: string | null, extra: Partial<SessionEventRow> = {}) =>
  ({
    id: `${sid}-${step}`, session_id: sid, user_id: "u", step, action, url, target: null, result: "ok", error: null,
    reasoning: null, observation: null, screenshot_path: path, timestamp: new Date(T0 + step * 18000).toISOString(), ...extra,
  }) as SessionEventRow;

export const EVENTS: SessionEventRow[] = [
  ev("s0", 0, "open", "https://acme.dev/", shot("home"), { target: "https://acme.dev", observation: "Hero says 'Product analytics your whole team understands'; Pricing is in the nav." }),
  ev("s0", 1, "scroll_down", "https://acme.dev/", shot("home-scrolled"), { reasoning: "I want to see what the product covers before checking cost.", observation: "Three feature cards: Journeys, Funnels, Alerts." }),
  ev("s0", 2, "click", "https://acme.dev/pricing", shot("pricing"), { target: 'link "Pricing"', reasoning: "Pricing is right in the navigation, so I'll go straight there.", observation: "Three plans side by side; Growth is highlighted at $49 / month." }),
  ev("s0", 3, "finish", "https://acme.dev/pricing", shot("pricing"), { result: "Growth is $49 / month for 5 projects and 1M events. Annual pricing isn't shown.", reasoning: "I have a price and a plan I can recommend to my CEO." }),
  ev("s1", 0, "open", "https://acme.dev/", shot("home")),
  ev("s1", 1, "click", "https://acme.dev/pricing", shot("pricing"), { target: 'link "Pricing"' }),
  ev("s2", 0, "open", "https://acme.dev/", shot("home")),
  ev("s2", 1, "navigate", "https://acme.dev/pricing", shot("pricing")),
];

export const FINDINGS = [
  { id: "f1", severity: "high", title: "Free trial button gives no feedback after clicking", description: "Visitors who click 'Start free trial' see nothing happen, so they assume it's broken and leave.", category: "conversion", confidence: "confirmed", impacted_personas: ["Tom", "Priya"], page_url: "https://acme.dev/pricing", evidence: [{ persona: "Tom", step: 3, note: "Clicked twice; the page didn't change." }], recommendation: "Show a loading state on click and take visitors straight to sign-up, with an error message if it fails." },
  { id: "f2", severity: "medium", title: "Annual pricing isn't shown on the pricing page", description: "Buyers comparing budgets have to calculate yearly costs themselves.", category: "content", confidence: "confirmed", impacted_personas: ["Priya"], page_url: "https://acme.dev/pricing", evidence: [{ persona: "Priya", step: 2, note: "Only monthly prices are listed." }], recommendation: "Add a monthly / annual toggle with the yearly total and any discount." },
  { id: "f3", severity: "medium", title: "Enterprise plan has no starting price", description: "'Contact sales' with no indication of cost makes larger teams hesitate.", category: "trust", confidence: "likely", impacted_personas: ["Priya", "Atlas"], page_url: "https://acme.dev/pricing", evidence: [{ persona: "Atlas", step: 1, note: "Enterprise lists no price." }], recommendation: "Show a 'from' price or typical range for Enterprise." },
  { id: "f4", severity: "low", title: "Prices aren't marked up as structured data", description: "AI assistants have to infer prices from page text.", category: "agent_readiness", confidence: "likely", impacted_personas: ["Atlas"], page_url: "https://acme.dev/pricing", evidence: [{ persona: "Atlas", step: 1, note: "No Product or Offer schema found." }], recommendation: "Add schema.org Product and Offer markup for each plan." },
] as unknown as FindingRow[];

export const TEST = {
  id: "t", user_id: "u", website_id: "w", title: TASK, goal: TASK, status: "complete", configuration: {}, error: null,
  created_at: new Date(T0).toISOString(), started_at: null, completed_at: null, share_token: null, shared_at: null,
  cancel_requested_at: null, heartbeat_at: null, attempts: 0,
  summary: {
    conclusion: "Yes. Pricing is one click from the homepage and plans are easy to compare, but the free trial button gives no feedback and annual pricing is missing.",
    top_fixes: [], readiness: [],
    counts: { personas: 3, success: 2, partial: 1, failed: 0, inconclusive: 0 },
  },
} as unknown as TestRow;

export const EVENTS_BY_SESSION = new Map<string, SessionEventRow[]>(SESSIONS.map((s) => [s.id, EVENTS.filter((e) => e.session_id === s.id)]));
