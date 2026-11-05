/**
 * URL normalisation shared by client and server. Pure — no network access.
 * Network safety (DNS / private ranges) lives in `@/lib/validation/network`.
 */
export type NormalizeResult = { ok: true; url: string; domain: string } | { ok: false; error: string };

export function normalizeUrl(input: string): NormalizeResult {
  const raw = input.trim();
  if (!raw) return { ok: false, error: "Enter a website URL." };
  if (raw.length > 2048) return { ok: false, error: "That URL is too long." };

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`;

  let u: URL;
  try {
    u = new URL(withScheme);
  } catch {
    return { ok: false, error: "That doesn't look like a valid URL." };
  }

  if (u.protocol !== "https:" && u.protocol !== "http:") {
    return { ok: false, error: "Only http and https websites can be explored." };
  }
  if (u.username || u.password) {
    return { ok: false, error: "URLs with embedded credentials aren't supported." };
  }

  const host = u.hostname.toLowerCase();
  if (!host.includes(".") || host.endsWith(".")) {
    return { ok: false, error: "Enter a public domain, like example.com." };
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    return { ok: false, error: "Local and internal addresses can't be tested." };
  }
  if (u.port && !["80", "443"].includes(u.port)) {
    return { ok: false, error: "Custom ports aren't supported." };
  }

  u.hash = "";
  u.hostname = host;
  let url = u.toString();
  if (u.pathname === "/" && !u.search) url = url.replace(/\/$/, "");

  return { ok: true, url, domain: host.replace(/^www\./, "") };
}

export function domainOf(url: string): string {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return url;
  }
}

/** True when `url` is on the same site as `domain` (including subdomains). */
export function isSameSite(url: string, domain: string): boolean {
  try {
    const h = new URL(url).hostname.toLowerCase().replace(/^www\./, "");
    return h === domain || h.endsWith(`.${domain}`);
  } catch {
    return false;
  }
}
