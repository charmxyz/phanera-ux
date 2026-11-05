import "server-only";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { normalizeUrl } from "./url";

/** Blocks loopback, private, link-local, CGNAT, multicast and reserved ranges. */
export function isPrivateAddress(ip: string): boolean {
  const v = isIP(ip);
  if (v === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  if (v === 6) {
    const s = ip.toLowerCase();
    if (s === "::" || s === "::1") return true;
    if (s.startsWith("::ffff:")) return isPrivateAddress(s.slice(7));
    return /^(fc|fd|fe8|fe9|fea|feb|ff)/.test(s);
  }
  return true;
}

export class UnsafeUrlError extends Error {}

/** Validates scheme/host and resolves DNS, rejecting any non-public destination. */
export async function assertPublicUrl(input: string): Promise<string> {
  const n = normalizeUrl(input);
  if (!n.ok) throw new UnsafeUrlError(n.error);
  const host = new URL(n.url).hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (isPrivateAddress(host)) throw new UnsafeUrlError("That address isn't publicly reachable.");
    return n.url;
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new UnsafeUrlError("We couldn't resolve that domain.");
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateAddress(a.address))) {
    throw new UnsafeUrlError("That domain resolves to a private or internal address.");
  }
  return n.url;
}

const UA =
  "Mozilla/5.0 (compatible; PhaneraBot/0.1; +https://phanera.app/bot) AppleWebKit/537.36 (KHTML, like Gecko)";

/**
 * fetch() that re-validates every redirect hop against the network policy,
 * enforces a timeout and caps the body size.
 */
export async function safeFetch(
  url: string,
  { timeoutMs = 10_000, maxBytes = 3_000_000, maxRedirects = 5 } = {},
): Promise<{ url: string; status: number; contentType: string; body: string }> {
  let current = url;
  for (let hop = 0; hop <= maxRedirects; hop++) {
    await assertPublicUrl(current);
    const res = await fetch(current, {
      redirect: "manual",
      signal: AbortSignal.timeout(timeoutMs),
      headers: { "user-agent": UA, accept: "text/html,application/xhtml+xml,text/plain,application/xml;q=0.9,*/*;q=0.5" },
    });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) break;
      current = new URL(loc, current).toString();
      continue;
    }
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > maxBytes) {
          await reader.cancel();
          break;
        }
        chunks.push(value);
      }
    }
    const body = new TextDecoder().decode(Buffer.concat(chunks));
    return { url: current, status: res.status, contentType: res.headers.get("content-type") ?? "", body };
  }
  throw new UnsafeUrlError("Too many redirects.");
}
