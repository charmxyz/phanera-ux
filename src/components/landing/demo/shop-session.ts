/**
 * One illustrative persona session for the homepage: Dana, the desktop persona from the
 * dashboard demo, buying a charger on "northcart.shop". The store is a fictional mock built
 * for this demo (scripts/demo-shop-shots.mjs renders it); screenshots are at the agent's
 * desktop viewport (1366×860) in /public/demo/shop. Observations describe what's on them.
 */
import type { JourneyEvent, JourneyIssue } from "@/components/sessions/journey";
import type { ReplayEvent } from "@/components/sessions/session-replay";

export const DOMAIN = "northcart.shop";
export const GOAL = "Can a shopper buy a USB-C charger and get to the payment step?";
export const PERSONA = {
  name: "Dana",
  role: "Parent shopping on a lunch break",
  device: "desktop",
  motivation: "Getting it ordered quickly, without surprises at checkout.",
  behaviour: "Searches instead of browsing; tidies the cart before paying.",
  confident: "The order summary shows exactly what they meant to buy, at the right price.",
};

/** The four personas in the demo test. Avatars are seeded with name + role, as in the dashboard. */
export type DemoPersona = { name: string; role: string; device: "desktop" | "mobile"; ai?: boolean; goal: string; behaviour: string };
export const PERSONAS: DemoPersona[] = [
  { name: "Dana", role: "Parent shopping on a lunch break", device: "desktop", goal: "Getting it ordered quickly, without surprises at checkout.", behaviour: "Searches instead of browsing; tidies the cart before paying." },
  { name: "Ken", role: "Retired teacher", device: "desktop", goal: "Not paying for anything they didn't mean to buy.", behaviour: "Reads every line of the order summary." },
  { name: "Atlas", role: "AI shopping assistant", device: "desktop", ai: true, goal: "Getting its user the right item at the right price.", behaviour: "Reads page structure and text, not visuals." },
  { name: "Marco", role: "University student", device: "mobile", goal: "Staying inside a tight monthly budget.", behaviour: "Shops one-handed on a phone and taps quickly." },
];
export const personaSeed = (name: string) => name + (PERSONAS.find((p) => p.name === name)?.role ?? "");

/** The test's usability findings, most severe first, with the evidence and suggested fix the report gives. */
export type Severity = "High" | "Medium" | "Low";
export const SEV_DOT: Record<Severity, string> = { High: "bg-destructive", Medium: "bg-warning", Low: "bg-muted-foreground/50" };
export const FINDINGS: { sev: Severity; t: string; p: string[]; fix: string; evidence?: { shot: string; caption: string } }[] = [
  {
    sev: "High", t: "Cart quantity can go to −1, taking the item's price off the order total", p: ["Dana", "Marco"],
    fix: "Keep quantity at 1 or more in the cart and on the server, and reject any order line below 1 at checkout.",
    evidence: { shot: "/demo/shop/cart-negative.jpg", caption: "Dana, step 6: “Quantity now reads −1. Subtotal (0 items): $18.00.”" },
  },
  {
    sev: "Medium", t: "“−” at quantity 1 leaves the item in the cart at 0 instead of removing it", p: ["Dana", "Ken"],
    fix: "At quantity 1, turn “−” into a Delete button so one tap removes the item.",
  },
  {
    sev: "Medium", t: "Place your order stays enabled with a negative quantity in the order", p: ["Dana", "Marco"],
    fix: "Check the cart before checkout opens. Disable Place your order and say which line needs fixing.",
  },
  {
    sev: "Low", t: "Quantity buttons have no accessible names", p: ["Atlas"],
    fix: "Label them, e.g. “Decrease quantity of Kordwell cable”, so assistants and screen readers know what they change.",
  },
];

const T0 = Date.parse("2026-11-10T12:20:00Z");
const BASE = `https://${DOMAIN}`;
const shot = (name: string) => `/demo/shop/${name}.jpg`;

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
    step: 0, at: 0, action: "open", url: `${BASE}/`, shot: "home", target: BASE, error: null,
    observation: "Storefront with a search bar across the header, a tech deals banner and category cards.",
  },
  {
    step: 1, at: 9, action: "type", url: `${BASE}/s?k=usb-c+charger`, shot: "search", target: 'searchbox "Search Northcart"', error: null,
    reasoning: "I know what I want. Searching is faster than the menus.",
    observation: "Over 2,000 results for “usb-c charger”. The first is a Voltaro 65W 3-port charger at $29.99, marked Best Seller.",
  },
  {
    step: 2, at: 21, action: "click", url: `${BASE}/dp/VT65W3`, shot: "product", target: 'link "Voltaro 65W USB-C Charger, 3-Port GaN…"', error: null,
    reasoning: "Best seller, good reviews, and it can charge a laptop too.",
    observation: "$29.99, down from $39.99. In stock, free delivery Thursday, November 12.",
  },
  {
    step: 3, at: 33, action: "scroll_down", url: `${BASE}/dp/VT65W3`, shot: "product-scrolled", error: null,
    reasoning: "Checking whether I need anything else with it.",
    observation: "Frequently bought together: the charger and a Kordwell USB-C cable 2-pack ($11.99), $41.98 for both.",
  },
  {
    step: 4, at: 44, action: "click", url: `${BASE}/cart`, shot: "cart", target: 'button "Add both to Cart"', error: null,
    reasoning: "A spare cable for the car would be handy. Adding both.",
    observation: "Cart: charger (quantity 1) and cable 2-pack (quantity 1). Subtotal (2 items): $41.98. The charger line says it includes a 1 m USB-C cable.",
  },
  {
    step: 5, at: 58, action: "click", url: `${BASE}/cart`, shot: "cart-zero", target: 'button "−" (Kordwell cable)', error: null,
    reasoning: "The charger already comes with a cable, so I don't need the 2-pack. Taking it out.",
    observation: "The cable is still in the cart, now at quantity 0. Subtotal (1 item): $29.99.",
  },
  {
    step: 6, at: 66, action: "click", url: `${BASE}/cart`, shot: "cart-negative", target: 'button "−" (Kordwell cable)', error: null,
    reasoning: "It's still listed. Maybe the tap didn't register. Trying again.",
    observation: "Quantity now reads −1. Subtotal (0 items): $18.00, the cable's $11.99 taken off the charger's price.",
  },
  {
    step: 7, at: 79, action: "click", url: `${BASE}/checkout`, shot: "checkout", target: 'button "Proceed to checkout"', error: null,
    reasoning: "That total can't be right. Let me see what checkout says before I pay.",
    observation: "Checkout lists the cable at Qty −1. Items: $18.00, order total $19.35 with tax. Place your order is enabled.",
  },
  {
    step: 8, at: 97, action: "finish", url: `${BASE}/checkout`, shot: "checkout", error: null,
    reasoning: "I've reached the payment step, but I wouldn't place this order.",
    result: "Reached the payment step, but the order is wrong. Tapping − on the cable took it to 0 and then to −1, and the cart subtracted $11.99. Checkout charges $18.00 for a $29.99 charger, with the cable at −1, and still lets the order be placed.",
  },
];

export const ISSUES: JourneyIssue[] = [
  { step: 5, issue: "“−” at quantity 1 doesn't remove the item; the cable stays in the cart at quantity 0.", isWebsiteIssue: true, directlyObserved: true },
  { step: 6, issue: "The cart accepts a quantity of −1 and subtracts $11.99 from the subtotal.", isWebsiteIssue: true, directlyObserved: true },
  { step: 7, issue: "Checkout shows the cable at Qty −1 and an $18.00 item total, and Place your order is still enabled.", isWebsiteIssue: true, directlyObserved: true },
];

export const JOURNEY_EVENTS: JourneyEvent[] = STEPS.map((s) => ({
  step: s.step, action: s.action, url: s.url, error: s.error,
  target: s.target ?? null, reasoning: s.reasoning ?? null, observation: s.observation ?? null,
  result: s.result ?? null, screenshotUrl: shot(s.shot),
}));

export const REPLAY_EVENTS: ReplayEvent[] = STEPS.map((s) => ({
  id: `dana-${s.step}`, step: s.step, timestamp: new Date(T0 + s.at * 1000).toISOString(), action: s.action,
  target: s.target ?? null, url: s.url, result: s.result ?? null, reasoning: s.reasoning ?? null, error: s.error,
  screenshotUrl: shot(s.shot),
}));

export const STARTED_AT = new Date(T0).toISOString();
export const FINAL_REPORT = STEPS[STEPS.length - 1].result ?? null;
