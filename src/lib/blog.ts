import "server-only";
import fs from "node:fs";
import path from "node:path";
import { Marked } from "marked";

export const SITE_URL = "https://www.phanera.com";

/** Blog posts are Markdown files with simple `key: value` frontmatter in content/blog. */
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  keyword: string;
  readingTime: number;
};

export type Post = PostMeta & { html: string; headings: { id: string; text: string }[] };

function parseFrontmatter(source: string): { data: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(source);
  if (!match) return { data: {}, body: source };
  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const value = line.slice(i + 1).trim().replace(/^(["'])([\s\S]*)\1$/, "$2");
    data[line.slice(0, i).trim()] = value;
  }
  return { data, body: source.slice(match[0].length) };
}

function readPost(slug: string) {
  const { data, body } = parseFrontmatter(fs.readFileSync(path.join(BLOG_DIR, `${slug}.md`), "utf8"));
  const meta: PostMeta = {
    slug,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "",
    keyword: data.keyword ?? "",
    readingTime: Number(data.readingTime) || Math.max(1, Math.round(body.split(/\s+/).length / 230)),
  };
  return { meta, body };
}

export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => f.replace(/\.md$/, ""));
}

export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => readPost(slug).meta)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;|&#\d+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export function getPost(slug: string): Post | null {
  if (!getPostSlugs().includes(slug)) return null;
  const { meta, body } = readPost(slug);
  const headings: Post["headings"] = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const id = slugify(text);
        if (depth === 2) headings.push({ id, text: text.replace(/<[^>]+>/g, "") });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const external = /^https?:\/\//.test(href) && !href.startsWith(SITE_URL);
        const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
        return `<a href="${href}"${title ? ` title="${title}"` : ""}${attrs}>${text}</a>`;
      },
      table(token) {
        // Wrap tables so wide ones scroll on phones instead of the page.
        const head = token.header.map((c) => `<th>${this.parser.parseInline(c.tokens)}</th>`).join("");
        const rows = token.rows
          .map((r) => `<tr>${r.map((c) => `<td>${this.parser.parseInline(c.tokens)}</td>`).join("")}</tr>`)
          .join("");
        return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
      },
    },
  });
  const html = marked.parse(body, { async: false });
  return { ...meta, html, headings };
}
