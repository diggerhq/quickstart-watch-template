import { lookup } from "node:dns/promises";
import { request } from "node:https";
import ipaddr from "ipaddr.js";

export function publicAddress(address: string) {
  try { return ipaddr.process(address).range() === "unicast"; } catch { return false; }
}
export function normalizeUrl(value: string): URL {
  const url = new URL(value.includes("://") ? value : `https://${value}`);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") || !url.hostname.includes(".") || /(^|\.)(localhost|local|internal|test|invalid)$/i.test(url.hostname))
    throw new Error("Enter a public HTTPS URL without credentials or a custom port.");
  if (ipaddr.isValid(url.hostname) && !publicAddress(url.hostname)) throw new Error("Private addresses are not supported.");
  // URL tokens are easily leaked into reports. This template accepts clean documentation URLs.
  if (url.search) throw new Error("Use a documentation URL without query parameters.");
  url.hash = "";
  return url;
}
export type HttpResult = { status: number; body: string; url: string; headers: Record<string, string | string[] | undefined> };
export type Transport = (url: string, options?: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> }) => Promise<HttpResult>;

// DNS is validated AND pinned on each hop to prevent rebinding to private services.
export const publicRequest: Transport = async (value, options = {}) => {
  let url = new URL(value);
  for (let hop = 0; hop < 5; hop++) {
    const query = url.search; url.search = "";
    url = normalizeUrl(url.href); url.search = query;
    const addresses = await lookup(url.hostname, { all: true });
    if (!addresses.length || addresses.some(a => !publicAddress(a.address))) throw new Error("URL must resolve only to public addresses.");
    const chosen = addresses[0];
    const body = options.body === undefined ? undefined : JSON.stringify(options.body);
    const result = await new Promise<HttpResult>((resolve, reject) => {
      const req = request(url, {
        method: options.method || "GET", signal: AbortSignal.timeout(15000),
        headers: { "user-agent": "QuickstartWatch/0.1", accept: "application/json, text/html, text/plain", ...(body ? { "content-type": "application/json", "content-length": String(Buffer.byteLength(body)) } : {}), ...options.headers },
        lookup: ((_host: unknown, opts: { all?: boolean }, cb: (...args: any[]) => void) => opts.all ? cb(null, [chosen]) : cb(null, chosen.address, chosen.family)) as any,
      }, res => {
        const chunks: Buffer[] = []; let size = 0;
        res.on("data", chunk => {
          size += chunk.length;
          if (size > 1_000_000) { req.destroy(new Error("Response exceeds 1 MB.")); return; }
          chunks.push(chunk);
        });
        res.on("error", reject);
        res.on("end", () => resolve({ status: res.statusCode || 500, body: Buffer.concat(chunks).toString("utf8"), url: url.href, headers: res.headers }));
      });
      req.on("error", reject); req.end(body);
    });
    if (result.status >= 300 && result.status < 400 && result.headers.location) {
      // Never replay reports through a redirect; the discovery document must advertise the final endpoint.
      if (options.method === "POST") throw new Error("Feedback endpoint redirected; submission is unconfirmed.");
      url = new URL(String(result.headers.location), url); continue;
    }
    return result;
  }
  throw new Error("Too many redirects.");
};
