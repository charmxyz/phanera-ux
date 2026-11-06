// Renders the five hackathon promo slides to PNG (3840×2160, 16:9).
// Needs the app running with the promo pages enabled, e.g.
//   ENABLE_PROMO=1 pnpm build && ENABLE_PROMO=1 pnpm start -p 3456
//   node scripts/promo-shots.mjs http://localhost:3456
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3000";
const out = "docs/promo";
await mkdir(out, { recursive: true });
await mkdir("public/promo/shots", { recursive: true });

const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

// 1. Screenshots of the fictional Acme site become the session replay evidence.
const site = await browser.newPage({ viewport: { width: 1366, height: 860 } });
for (const [path, name, scroll] of [["/promo/site", "home", 0], ["/promo/site", "home-scrolled", 520], ["/promo/site/pricing", "pricing", 0]]) {
  await site.goto(base + path, { waitUntil: "networkidle" });
  // Crop from the full page so the "scrolled" shot really starts lower down.
  await site.screenshot({ path: `public/promo/shots/${name}.jpg`, type: "jpeg", quality: 85, fullPage: true, clip: { x: 0, y: scroll, width: 1366, height: 860 } });
}
await site.close();

// 2. The slides themselves.
const names = ["01-hero", "02-ai-personas", "03-live-usability-test", "04-session-replay", "05-usability-findings"];
for (let i = 1; i <= 5; i++) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2 });
  // "load", not "networkidle": the dev server (and the embedded homepage) keep sockets open.
  await page.goto(`${base}/promo/${i}`, { waitUntil: "load" });
  // Hide the Next.js dev badge if present, then let the 3D scenes assemble.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await page.waitForTimeout(i === 1 ? 22000 : i === 3 ? 9000 : 2500);
  await page.screenshot({ path: `${out}/${names[i - 1]}.png`, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
  console.log("saved", `${out}/${names[i - 1]}.png`);
  await page.close();
}
await browser.close();
