import "server-only";
import * as cheerio from "cheerio";
import { safeFetch } from "@/lib/validation/network";
import { isSameSite, domainOf } from "@/lib/validation/url";

export type ExtractedPage = {
  url: string;
  status: number;
  title: string;
  description: string;
  text: string;
  wordCount: number;
  nav: string[];
  links: string[];
  signals: PageSignals;
};

export type PageSignals = {
  h1Count: number;
  headingCount: number;
  images: number;
  imagesWithAlt: number;
  landmarks: { main: boolean; nav: boolean; header: boolean; footer: boolean };
  jsonLd: boolean;
  lang: boolean;
  viewport: boolean;
  metaDescription: boolean;
  canonical: boolean;
  openGraph: boolean;
  scriptCount: number;
  /** Little server-rendered text but many scripts → content probably needs JS. */
  likelyJsRendered: boolean;
  unlabelledButtons: number;
  unlabelledInputs: number;
};

export type SiteSignals = {
  robotsTxt: boolean;
  sitemap: boolean;
  sitemapUrlCount: number;
  llmsTxt: boolean;
  blockedByRobots: string[];
};

const MAX_TEXT_CHARS = 6000;

function extract(url: string, status: number, html: string, domain: string): ExtractedPage {
  const $ = cheerio.load(html);
  const scriptCount = $("script").length;
  const jsonLd = $('script[type="application/ld+json"]').length > 0;

  const nav: string[] = [];
  $("nav a, header a").each((_, el) => {
    const t = $(el).text().replace(/\s+/g, " ").trim();
    if (t && t.length < 60 && !nav.includes(t)) nav.push(t);
  });

  const links = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("#") || /^(mailto|tel|javascript):/i.test(href)) return;
    try {
      const abs = new URL(href, url);
      abs.hash = "";
      if (isSameSite(abs.toString(), domain) && /^https?:$/.test(abs.protocol)) links.add(abs.toString());
    } catch {}
  });

  const images = $("img").length;
  const imagesWithAlt = $("img[alt]").filter((_, el) => ($(el).attr("alt") ?? "").trim().length > 0).length;
  const unlabelledButtons = $("button").filter(
    (_, el) => !$(el).text().trim() && !$(el).attr("aria-label") && !$(el).attr("aria-labelledby") && !$(el).attr("title"),
  ).length;
  const unlabelledInputs = $("input:not([type=hidden]):not([type=submit]), textarea, select").filter((_, el) => {
    const id = $(el).attr("id");
    return !$(el).attr("aria-label") && !$(el).attr("aria-labelledby") && !(id && $(`label[for="${id}"]`).length) && !$(el).closest("label").length;
  }).length;

  const landmarks = {
    main: $("main, [role=main]").length > 0,
    nav: $("nav, [role=navigation]").length > 0,
    header: $("header, [role=banner]").length > 0,
    footer: $("footer, [role=contentinfo]").length > 0,
  };

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content")?.trim() ?? "";
  const h1Count = $("h1").length;
  const headingCount = $("h1,h2,h3,h4").length;

  $("script, style, noscript, svg, iframe, template").remove();
  const root = $("main").length ? $("main") : $("body");
  const text = root.text().replace(/\s+/g, " ").trim();
  const wordCount = text ? text.split(" ").length : 0;

  return {
    url,
    status,
    title,
    description,
    text: text.slice(0, MAX_TEXT_CHARS),
    wordCount,
    nav: nav.slice(0, 40),
    links: [...links],
    signals: {
      h1Count,
      headingCount,
      images,
      imagesWithAlt,
      landmarks,
      jsonLd,
      lang: Boolean($("html").attr("lang")),
      viewport: $('meta[name="viewport"]').length > 0,
      metaDescription: description.length > 0,
      canonical: $('link[rel="canonical"]').length > 0,
      openGraph: $('meta[property^="og:"]').length > 0,
      scriptCount,
      likelyJsRendered: wordCount < 80 && scriptCount > 3,
      unlabelledButtons,
      unlabelledInputs,
    },
  };
}

function parseRobots(body: string) {
  // Minimal robots.txt support: Disallow rules for `*` and PhaneraBot, plus Sitemap lines.
  const disallow: string[] = [];
  const sitemaps: string[] = [];
  let applies = false;
  for (const raw of body.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const [, k, v] = m;
    const key = k.toLowerCase();
    if (key === "user-agent") applies = v === "*" || /phanerabot/i.test(v);
    else if (key === "disallow" && applies && v) disallow.push(v);
    else if (key === "sitemap") sitemaps.push(v);
  }
  return { disallow, sitemaps };
}

/** Score candidate URLs so homepage, primary navigation and high-value pages come first. */
function priority(url: string, navLinks: Set<string>): number {
  const path = new URL(url).pathname.toLowerCase();
  let score = 0;
  if (path === "/" || path === "") score += 100;
  if (navLinks.has(url)) score += 40;
  if (/pricing|plans/.test(path)) score += 35;
  if (/product|features|solutions|platform/.test(path)) score += 25;
  if (/docs|documentation|integrations|api|developers/.test(path)) score += 20;
  if (/about|contact|security|faq|customers/.test(path)) score += 15;
  if (/blog\/.+|news\/.+|\/tag\/|\/page\/\d|legal|privacy|terms|cookie|search/.test(path)) score -= 20;
  if (new URL(url).search) score -= 30;
  score -= path.split("/").filter(Boolean).length * 3;
  return score;
}

export type CrawlResult = { root: ExtractedPage; pages: ExtractedPage[]; site: SiteSignals; failed: string[] };

export async function crawlWebsite(
  startUrl: string,
  { maxPages, timeBudgetMs = 90_000, onProgress }: { maxPages: number; timeBudgetMs?: number; onProgress?: (stage: "discovering" | "extracting") => Promise<void> },
): Promise<CrawlResult> {
  const deadline = Date.now() + timeBudgetMs;
  const rootRes = await safeFetch(startUrl);
  if (rootRes.status >= 400) throw new Error(`The website responded with HTTP ${rootRes.status}.`);
  if (!/html/i.test(rootRes.contentType)) throw new Error("The URL did not return an HTML page.");

  const domain = domainOf(rootRes.url);
  const origin = new URL(rootRes.url).origin;
  const root = extract(rootRes.url, rootRes.status, rootRes.body, domain);

  await onProgress?.("discovering");

  // robots.txt, sitemap, llms.txt
  const site: SiteSignals = { robotsTxt: false, sitemap: false, sitemapUrlCount: 0, llmsTxt: false, blockedByRobots: [] };
  let disallow: string[] = [];
  const sitemapUrls = new Set<string>();
  const [robots, llms] = await Promise.allSettled([
    safeFetch(`${origin}/robots.txt`, { timeoutMs: 6000, maxBytes: 200_000 }),
    safeFetch(`${origin}/llms.txt`, { timeoutMs: 6000, maxBytes: 200_000 }),
  ]);
  const sitemapCandidates = [`${origin}/sitemap.xml`];
  if (robots.status === "fulfilled" && robots.value.status === 200 && /text\/plain/i.test(robots.value.contentType)) {
    site.robotsTxt = true;
    const parsed = parseRobots(robots.value.body);
    disallow = parsed.disallow;
    sitemapCandidates.unshift(...parsed.sitemaps);
  }
  site.llmsTxt = llms.status === "fulfilled" && llms.value.status === 200 && !/html/i.test(llms.value.contentType);

  for (const sm of [...new Set(sitemapCandidates)].slice(0, 3)) {
    try {
      const res = await safeFetch(sm, { timeoutMs: 8000, maxBytes: 2_000_000 });
      if (res.status !== 200 || !/<(urlset|sitemapindex)/i.test(res.body)) continue;
      site.sitemap = true;
      const $ = cheerio.load(res.body, { xml: true });
      $("loc").each((_, el) => {
        const loc = $(el).text().trim();
        if (isSameSite(loc, domain) && !/\.xml(\.gz)?$/i.test(loc)) sitemapUrls.add(loc);
      });
      if (sitemapUrls.size) break;
    } catch {}
  }
  site.sitemapUrlCount = sitemapUrls.size;

  const isAllowed = (u: string) => {
    const p = new URL(u).pathname;
    return !disallow.some((rule) => rule !== "/" ? p.startsWith(rule.replace(/\*.*$/, "")) : true);
  };

  const navLinks = new Set(root.links);
  const candidates = [...new Set([...root.links, ...sitemapUrls])]
    .filter((u) => u.replace(/\/$/, "") !== root.url.replace(/\/$/, ""))
    .filter((u) => !/\.(pdf|png|jpe?g|gif|svg|zip|mp4|webp|css|js|xml)$/i.test(new URL(u).pathname));
  const allowed: string[] = [];
  for (const u of candidates) (isAllowed(u) ? allowed : site.blockedByRobots).push(u);
  site.blockedByRobots = site.blockedByRobots.slice(0, 20);

  const queue = allowed.sort((a, b) => priority(b, navLinks) - priority(a, navLinks)).slice(0, Math.max(0, maxPages - 1));

  await onProgress?.("extracting");

  const pages: ExtractedPage[] = [root];
  const failed: string[] = [];
  const CONCURRENCY = 3;
  for (let i = 0; i < queue.length && Date.now() < deadline; i += CONCURRENCY) {
    const batch = queue.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(batch.map((u) => safeFetch(u, { timeoutMs: 10_000 })));
    results.forEach((r, j) => {
      if (r.status === "fulfilled" && r.value.status < 400 && /html/i.test(r.value.contentType) && isSameSite(r.value.url, domain)) {
        if (!pages.some((p) => p.url === r.value.url)) pages.push(extract(r.value.url, r.value.status, r.value.body, domain));
      } else failed.push(batch[j]);
    });
  }

  return { root, pages, site, failed };
}

/** Aggregate measured, objective readiness signals across all crawled pages. */
export function measureReadiness(crawl: CrawlResult) {
  const ps = crawl.pages;
  const n = ps.length || 1;
  const sum = (f: (p: ExtractedPage) => number) => ps.reduce((a, p) => a + f(p), 0);
  const pct = (f: (p: ExtractedPage) => boolean) => Math.round((ps.filter(f).length / n) * 100);
  const images = sum((p) => p.signals.images);
  return {
    pagesAnalysed: ps.length,
    pagesFailed: crawl.failed.length,
    robotsTxt: crawl.site.robotsTxt,
    sitemap: crawl.site.sitemap,
    sitemapUrlCount: crawl.site.sitemapUrlCount,
    llmsTxt: crawl.site.llmsTxt,
    blockedByRobotsCount: crawl.site.blockedByRobots.length,
    pctWithSingleH1: pct((p) => p.signals.h1Count === 1),
    pctWithMainLandmark: pct((p) => p.signals.landmarks.main),
    pctWithNavLandmark: pct((p) => p.signals.landmarks.nav),
    pctWithMetaDescription: pct((p) => p.signals.metaDescription),
    pctWithStructuredData: pct((p) => p.signals.jsonLd),
    pctWithLang: pct((p) => p.signals.lang),
    pctLikelyJsRendered: pct((p) => p.signals.likelyJsRendered),
    imageAltCoveragePct: images ? Math.round((sum((p) => p.signals.imagesWithAlt) / images) * 100) : null,
    unlabelledButtons: sum((p) => p.signals.unlabelledButtons),
    unlabelledInputs: sum((p) => p.signals.unlabelledInputs),
    avgWordsPerPage: Math.round(sum((p) => p.wordCount) / n),
  };
}
export type MeasuredReadiness = ReturnType<typeof measureReadiness>;
