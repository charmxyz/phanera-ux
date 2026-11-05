/**
 * Turns a session's recorded steps into a page-to-page journey.
 *
 * Each recorded step stores the URL *after* its action, so a step belongs to the page
 * the agent was on *before* acting (the previous step's URL). Whenever the URL changes,
 * a new page visit starts, joined by an edge labelled with the action that caused it.
 * Revisits (e.g. after "go back") become new visits, so the graph reads as a timeline.
 */

export type JourneyEvent = {
  step: number;
  action: string;
  target: string | null;
  url: string | null;
  result: string | null;
  reasoning: string | null;
  observation: string | null;
  error: string | null;
  screenshotUrl: string | null;
};

export type JourneyIssue = { step: number | null; issue: string; isWebsiteIssue: boolean; directlyObserved: boolean };

export type JourneyStep = JourneyEvent & { issues: JourneyIssue[] };

export type PageVisit = {
  id: string;
  index: number;
  url: string;
  label: string;
  revisit: boolean;
  /** Step that brought the agent here (null for the first page). */
  arrivedBy: JourneyEvent | null;
  /** Actions taken while on this page. */
  steps: JourneyStep[];
  screenshotUrl: string | null;
  issueCount: number;
  hasError: boolean;
};

export type Journey = { visits: PageVisit[]; ending: JourneyEvent | null; generalIssues: JourneyIssue[] };

export function pageKey(url: string | null): string {
  if (!url) return "unknown";
  try {
    const u = new URL(url);
    if (u.protocol === "chrome-error:") return "chrome-error";
    return `${u.host}${u.pathname.replace(/\/$/, "") || "/"}${u.search}`;
  } catch {
    return url;
  }
}

export function pageLabel(url: string | null): string {
  if (!url) return "Unknown page";
  try {
    const u = new URL(url);
    if (u.protocol === "chrome-error:" || u.protocol === "about:") return "Browser error page";
    const path = u.pathname.replace(/\/$/, "") || "/";
    return `${path}${u.search}`;
  } catch {
    return url;
  }
}

const isEnding = (a: string) => a === "finish" || a === "give_up" || a === "error";

export function buildJourney(events: JourneyEvent[], issues: JourneyIssue[]): Journey {
  const sorted = [...events].sort((a, b) => a.step - b.step);
  const issuesFor = (step: number) => issues.filter((i) => i.step === step);
  const visits: PageVisit[] = [];
  const seen = new Set<string>();
  let ending: JourneyEvent | null = null;

  const startVisit = (url: string | null, arrivedBy: JourneyEvent | null) => {
    const key = pageKey(url);
    const visit: PageVisit = {
      id: `visit-${visits.length}`,
      index: visits.length,
      url: url ?? "",
      label: pageLabel(url),
      revisit: seen.has(key),
      arrivedBy,
      steps: [],
      screenshotUrl: arrivedBy?.screenshotUrl ?? null,
      issueCount: 0,
      hasError: false,
    };
    seen.add(key);
    visits.push(visit);
    return visit;
  };

  let current: PageVisit | null = null;
  for (const e of sorted) {
    if (!current) {
      // The first event is normally the "open" of the start URL.
      current = startVisit(e.url, null);
      if (e.action === "open") {
        current.screenshotUrl = e.screenshotUrl;
        current.hasError = Boolean(e.error);
        current.steps.push({ ...e, issues: issuesFor(e.step) });
        current.issueCount += issuesFor(e.step).length;
        continue;
      }
    }
    const step: JourneyStep = { ...e, issues: issuesFor(e.step) };
    if (isEnding(e.action)) ending = e;
    // The decision (observation, thinking, action) was made on the current page...
    current.steps.push(step);
    current.issueCount += step.issues.length;
    if (e.error) current.hasError = true;
    const moved = e.url && pageKey(e.url) !== pageKey(current.url) && !isEnding(e.action);
    if (moved) {
      // ...and its result is a new page visit (its screenshot shows the new page).
      current = startVisit(e.url, e);
      continue;
    }
    if (e.screenshotUrl) current.screenshotUrl = e.screenshotUrl;
  }

  const generalIssues = issues.filter((i) => i.step == null || !sorted.some((e) => e.step === i.step));
  return { visits, ending, generalIssues };
}
