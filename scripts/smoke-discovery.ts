// Smoke test for URL safety + crawler (no Supabase / Claude needed).
// Run: pnpm smoke:discovery https://example.com
import { assertPublicUrl } from "@/lib/validation/network";
import { normalizeUrl } from "@/lib/validation/url";
import { crawlWebsite, measureReadiness } from "@/lib/discovery/crawl";

async function main() {
  const target = process.argv[2] ?? "https://www.anthropic.com";
  for (const u of ["example.com", "ftp://x.com", "localhost:3000", "http://127.0.0.1", "http://169.254.169.254/latest", "http://10.0.0.5", "localtest.me", "https://user:pw@example.com"]) {
    const n = normalizeUrl(u);
    let verdict = n.ok ? `normalised ${n.url}` : `rejected: ${n.error}`;
    if (n.ok) {
      try {
        await assertPublicUrl(n.url);
        verdict += " → allowed";
      } catch (e) {
        verdict += ` → blocked: ${(e as Error).message}`;
      }
    }
    console.log(`${u.padEnd(32)} ${verdict}`);
  }
  console.log(`\nCrawling ${target} …`);
  const t = Date.now();
  const crawl = await crawlWebsite(target, { maxPages: 10 });
  console.log(`${crawl.pages.length} pages in ${Date.now() - t}ms, ${crawl.failed.length} failed`);
  for (const p of crawl.pages) console.log(`  ${p.wordCount.toString().padStart(5)}w  ${p.url}  — ${p.title.slice(0, 60)}`);
  console.log("\nMeasured readiness:", measureReadiness(crawl));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
