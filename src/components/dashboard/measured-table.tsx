import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { MeasuredReadiness } from "@/lib/discovery/crawl";

export function MeasuredTable({ m }: { m: MeasuredReadiness }) {
  const yes = (b: boolean) => (b ? "Yes" : "No");
  const rows: [string, string][] = [
    ["robots.txt", yes(m.robotsTxt)],
    ["XML sitemap", m.sitemap ? `Yes (${m.sitemapUrlCount} URLs)` : "No"],
    ["llms.txt", yes(m.llmsTxt)],
    ["Pages blocked by robots.txt", String(m.blockedByRobotsCount)],
    ["Pages with exactly one <h1>", `${m.pctWithSingleH1}%`],
    ["Pages with <main> landmark", `${m.pctWithMainLandmark}%`],
    ["Pages with <nav> landmark", `${m.pctWithNavLandmark}%`],
    ["Pages with meta description", `${m.pctWithMetaDescription}%`],
    ["Pages with structured data (JSON-LD)", `${m.pctWithStructuredData}%`],
    ["Pages with lang attribute", `${m.pctWithLang}%`],
    ["Pages likely needing JavaScript to render", `${m.pctLikelyJsRendered}%`],
    ["Image alt-text coverage", m.imageAltCoveragePct == null ? "No images" : `${m.imageAltCoveragePct}%`],
    ["Unlabelled buttons", String(m.unlabelledButtons)],
    ["Unlabelled form fields", String(m.unlabelledInputs)],
    ["Average words per page", String(m.avgWordsPerPage)],
  ];
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Signal</TableHead><TableHead className="text-right">Result</TableHead></TableRow></TableHeader>
      <TableBody>
        {rows.map(([k, v]) => (
          <TableRow key={k}><TableCell className="text-muted-foreground">{k}</TableCell><TableCell className="text-right font-mono text-xs">{v}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
