import { lookup } from "node:dns/promises";
import { request } from "node:https";
import { BlockList, isIP } from "node:net";

const nonPublicV4 = new BlockList();
for (const [address, prefix] of [
  ["0.0.0.0", 8], ["10.0.0.0", 8], ["100.64.0.0", 10], ["127.0.0.0", 8],
  ["169.254.0.0", 16], ["172.16.0.0", 12], ["192.0.0.0", 24], ["192.0.2.0", 24],
  ["192.31.196.0", 24], ["192.52.193.0", 24], ["192.88.99.0", 24], ["192.168.0.0", 16],
  ["192.175.48.0", 24], ["198.18.0.0", 15], ["198.51.100.0", 24], ["203.0.113.0", 24],
  ["224.0.0.0", 4], ["240.0.0.0", 4],
] as const) nonPublicV4.addSubnet(address, prefix, "ipv4");

const nonPublicV6 = new BlockList();
for (const [address, prefix] of [
  ["::", 128], ["::1", 128], ["::ffff:0:0", 96], ["64:ff9b::", 96], ["64:ff9b:1::", 48],
  ["100::", 64], ["2001::", 23], ["2001:db8::", 32], ["2002::", 16],
  ["3fff::", 20], ["5f00::", 16], ["fc00::", 7], ["fe80::", 10], ["fec0::", 10], ["ff00::", 8],
] as const) nonPublicV6.addSubnet(address, prefix, "ipv6");

export function publicAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return !nonPublicV4.check(address, "ipv4");
  if (family === 6) return !nonPublicV6.check(address, "ipv6");
  return false;
}
export function normalizeUrl(value: string): URL {
  const url = new URL(value.includes("://") ? value : `https://${value}`);
  if (url.protocol !== "https:" || url.username || url.password || (url.port && url.port !== "443") || !url.hostname.includes(".") || /(^|\.)(localhost|local|internal|test|invalid)$/i.test(url.hostname))
    throw new Error("Enter a public HTTPS URL without credentials or a custom port.");
  if (isIP(url.hostname) && !publicAddress(url.hostname)) throw new Error("Private addresses are not supported.");
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
