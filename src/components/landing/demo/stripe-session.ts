/**
 * One illustrative persona session on stripe.com for the homepage: Jordan, the desktop persona
 * from the dashboard demo. Screenshots are real stripe.com captures at the agent's desktop
 * viewport (1366×860), stored in /public/demo/stripe. Observations describe what's on them.
 */
import type { JourneyEvent, JourneyIssue } from "@/components/sessions/journey";
import type { ReplayEvent } from "@/components/sessions/session-replay";

export const GOAL = "Can a small online store owner find out what a card payment will cost them?";
export const PERSONA = {
  name: "Jordan",
  role: "Small business owner",
  device: "desktop",
  motivation: "Not losing sales to fees they didn't see coming.",
  behaviour: "Skims headings, then reads pricing closely.",
  confident: "They can quote what one card payment will cost, including customers abroad.",
};

const T0 = Date.parse("2026-11-10T10:00:00Z");
const shot = (name: string) => `/demo/stripe/${name}.jpg`;

type Step = Omit<JourneyEvent, "screenshotUrl" | "observation" | "reasoning" | "target" | "result"> & {
  at: number; // seconds since start
  shot: string;
  target?: string;
  reasoning?: string;
  observation?: string;
  result?: string;
};

const STEPS: Step[] = [
  {
    step: 0, at: 0, action: "open", url: "https://stripe.com/gb", shot: "home", target: "https://stripe.com", error: null,
    observation: "Hero reads “Financial infrastructure to grow your revenue.” Pricing is a top-level link in the navigation.",
  },
  {
    step: 1, at: 14, action: "click", url: "https://stripe.com/gb/pricing", shot: "pricing", target: 'link "Pricing"', error: null,
    reasoning: "I only care what a card payment costs me, and Pricing is right there in the nav.",
    observation: "Standard plan: 1.5% + 20p for standard UK cards, 2.5% + 20p for EU cards. Nothing about cards from outside Europe.",
  },
  {
    step: 2, at: 29, action: "scroll_down", url: "https://stripe.com/gb/pricing", shot: "pricing-scrolled-1", error: null,
    reasoning: "Some of my customers are in the US. I need that rate too.",
    observation: "A grid of features: global access, fraud prevention, payouts, support. No prices.",
  },
  {
    step: 3, at: 38, action: "scroll_down", url: "https://stripe.com/gb/pricing", shot: "pricing-scrolled-2", error: null,
    reasoning: "Still no rate for non-European cards. Keep going.",
    observation: "“Explore pricing for the full Stripe platform”, with a product menu on the left.",
  },
  {
    step: 4, at: 49, action: "scroll_down", url: "https://stripe.com/gb/pricing", shot: "pricing-scrolled-3", error: null,
    observation: "International cards: 3.15% + 20p, plus 2% if currency conversion is required. Premium UK cards are 2.8% + 20p.",
  },
  {
    step: 5, at: 66, action: "click", url: "https://stripe.com/gb/payments/payment-methods", shot: "payment-methods", target: 'link "See more payment methods"', error: null,
    reasoning: "Do wallets like Apple Pay cost extra? Let me check.",
    observation: "A product page about payment methods. No prices on it.",
  },
  {
    step: 6, at: 84, action: "go_back", url: "https://stripe.com/gb/pricing", shot: "pricing-scrolled-3", error: null,
    reasoning: "This page is about features, not cost. Back to the pricing table.",
  },
  {
    step: 7, at: 101, action: "finish", url: "https://stripe.com/gb/pricing", shot: "pricing-scrolled-3", error: null,
    reasoning: "I can now quote every rate my store would pay.",
    result: "A standard UK card costs 1.5% + 20p and an EU card 2.5% + 20p. Cards from outside Europe cost 3.15% + 20p, plus 2% when currency conversion is needed.",
  },
];

export const ISSUES: JourneyIssue[] = [
  { step: 4, issue: "The rate for cards from outside Europe sits three screens below the headline rates, past a features grid.", isWebsiteIssue: true, directlyObserved: true },
  { step: 5, issue: "“See more payment methods” in the pricing table leads to a product page with no prices.", isWebsiteIssue: true, directlyObserved: true },
];

export const JOURNEY_EVENTS: JourneyEvent[] = STEPS.map((s) => ({
  step: s.step, action: s.action, url: s.url, error: s.error,
  target: s.target ?? null, reasoning: s.reasoning ?? null, observation: s.observation ?? null,
  result: s.result ?? null, screenshotUrl: shot(s.shot),
}));

export const REPLAY_EVENTS: ReplayEvent[] = STEPS.map((s) => ({
  id: `jordan-${s.step}`, step: s.step, timestamp: new Date(T0 + s.at * 1000).toISOString(), action: s.action,
  target: s.target ?? null, url: s.url, result: s.result ?? null, reasoning: s.reasoning ?? null, error: s.error,
  screenshotUrl: shot(s.shot),
}));

export const STARTED_AT = new Date(T0).toISOString();
export const FINAL_REPORT = STEPS[STEPS.length - 1].result ?? null;
