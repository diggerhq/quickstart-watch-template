import { createHash } from 'node:crypto';
import { normalizeUrl } from './network.js';
export type NotificationConfig = { monitorId: string; url: string; email: string };
export function getNotificationConfig(env: NodeJS.ProcessEnv = process.env): NotificationConfig | null {
  const rawUrl = env.WATCH_URL?.trim(), email = env.WATCH_EMAIL?.trim().toLowerCase();
  if (!rawUrl && !email) return null;
  if (!rawUrl || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Set WATCH_URL and a valid WATCH_EMAIL in OpenComputer runtime variables.');
  const url = normalizeUrl(rawUrl).href;
  const monitorId = createHash('sha256').update(JSON.stringify([url,email])).digest('hex').slice(0,32);
  return {monitorId,url,email};
}
