// Smoke test for the agent's browser mechanics (local Chromium, no Claude/Daytona).
// Requires: npx playwright install chromium
import { chromium } from "playwright-core";
import { snapshot, guardContext } from "@/lib/agents/persona-agent";

async function main() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  await guardContext(context, "example.com");
  const page = await context.newPage();
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
  const snap = await snapshot(page);
  console.log("title:", snap.title);
  console.log("elements:", snap.elements);

  // Off-domain navigation must be blocked.
  const off = await page.goto("https://www.iana.org/", { timeout: 10_000 }).then(() => "ALLOWED (bad)").catch((e) => `blocked: ${String(e.message).split("\n")[0]}`);
  console.log("off-domain navigation →", off);

  // Non-GET document navigation (form submit) must be blocked.
  const page2 = await context.newPage();
  await page2.goto("https://example.com", { waitUntil: "domcontentloaded" });
  await page2.setContent(`<form method="post" action="https://example.com/submit"><button id="b">Go</button></form>`);
  const res = await Promise.all([page2.waitForEvent("requestfailed", { timeout: 5000 }).then((r) => `blocked: ${r.failure()?.errorText}`).catch(() => "no failure (bad)"), page2.click("#b")]);
  console.log("POST form submission →", res[0]);
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
