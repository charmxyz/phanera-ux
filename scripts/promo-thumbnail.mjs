// Renders the 1920×1080 thumbnail (saved at 3840×2160) to docs/promo/thumbnail.png.
//   ENABLE_PROMO=1 pnpm build && ENABLE_PROMO=1 pnpm start -p 3456
//   node scripts/promo-thumbnail.mjs http://localhost:3456
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:3000";
await mkdir("docs/promo", { recursive: true });
const browser = await chromium.launch({ args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
// Reduced motion renders the finished flower: ants on the stamens, tinted petals.
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 2, reducedMotion: "reduce" });
const page = await ctx.newPage();
await page.goto(`${base}/promo/thumbnail`, { waitUntil: "load" });
await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
await page.waitForTimeout(6000);
await page.screenshot({ path: "docs/promo/thumbnail.png", clip: { x: 0, y: 0, width: 1920, height: 1080 } });
console.log("saved docs/promo/thumbnail.png");
await browser.close();
