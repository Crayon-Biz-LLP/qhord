import axios from 'axios';
import dns from 'dns';
import http from 'http';
import https from 'https';
import net from 'net';
import { encrypt, decrypt } from '../../config/encryption';

// Shared by the Send webhook workflow action and the builder's "Test connection" endpoint,
// so both build the request the same way and share the same outbound-target restrictions.

export const SECRET_PLACEHOLDER = '__stored__';

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const BODY_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RESPONSE_BYTES = 1_000_000;

export class WebhookConfigError extends Error {}
export class BlockedTargetError extends WebhookConfigError {}

// ── Secrets at rest ───────────────────────────────────────────────
// The auth password / token / API-key value is stored encrypted in the node's config and is
// never sent back to the browser — clients only ever see SECRET_PLACEHOLDER.

function sealWebhookConfig(config: any, existing?: any): any {
  const next = { ...(config || {}) };
  const incoming = next.authSecret;
  if (!incoming) {
    delete next.authSecret;
  } else if (incoming === SECRET_PLACEHOLDER) {
    // Unchanged in the UI: keep whatever was stored before (if anything).
    if (existing?.authSecret) next.authSecret = existing.authSecret;
    else delete next.authSecret;
  } else {
    next.authSecret = encrypt(String(incoming));
  }
  return next;
}

export function sealNodeConfig(tool: string | undefined, config: any, existing?: any): any {
  return tool === 'send_webhook' ? sealWebhookConfig(config, existing) : config;
}

export function maskNodeConfig(tool: string | undefined, config: any): any {
  if (tool !== 'send_webhook' || !config?.authSecret) return config;
  return { ...config, authSecret: SECRET_PLACEHOLDER };
}

export function openStoredSecret(stored?: string): string {
  return stored ? decrypt(stored) : '';
}

// ── Request building ──────────────────────────────────────────────

export interface PreparedWebhookRequest {
  url: string;
  method: string;
  headers: Record<string, string>;
  data?: any;
}

function parseHeaderEntries(raw: any): [string, string][] {
  let entries: [string, string][] = [];
  if (Array.isArray(raw)) {
    entries = raw.map((h: any) => [String(h?.key ?? '').trim(), String(h?.value ?? '')] as [string, string]);
  } else if (typeof raw === 'string' && raw.trim()) {
    try {
      entries = Object.entries(JSON.parse(raw)).map(([k, v]) => [k.trim(), String(v)] as [string, string]);
    } catch {
      throw new WebhookConfigError('Headers must be a list of key/value pairs.');
    }
  } else if (raw && typeof raw === 'object') {
    entries = Object.entries(raw).map(([k, v]) => [k.trim(), String(v)] as [string, string]);
  }
  return entries.filter(([key]) => key);
}

// `secret` is the already-decrypted auth secret (callers resolve it; this never touches storage).
export function prepareWebhookRequest(config: any, secret: string): PreparedWebhookRequest {
  const url = typeof config?.url === 'string' ? config.url.trim() : '';
  if (!url) throw new WebhookConfigError('Webhook URL is required.');

  const method = String(config.method || 'GET').toUpperCase();
  if (!ALLOWED_METHODS.includes(method)) throw new WebhookConfigError(`Unsupported method: ${config.method}`);

  const headers: Record<string, string> = {};

  switch (config.authType) {
    case 'basic':
      headers['Authorization'] = 'Basic ' + Buffer.from(`${config.authUsername || ''}:${secret}`).toString('base64');
      break;
    case 'bearer':
      if (secret) headers['Authorization'] = `Bearer ${secret}`;
      break;
    case 'apikey':
      if (secret) headers[String(config.authKeyName || 'X-API-Key').trim()] = secret;
      break;
  }

  // Explicit headers win over the ones derived from the auth type.
  for (const [key, value] of parseHeaderEntries(config.headers)) headers[key] = value;

  let data: any = undefined;
  if (BODY_METHODS.includes(method) && config.body !== undefined && config.body !== '') {
    if (typeof config.body === 'string') {
      try {
        data = JSON.parse(config.body);
      } catch {
        data = config.body; // plain-text body
        if (!Object.keys(headers).some(h => h.toLowerCase() === 'content-type')) headers['Content-Type'] = 'text/plain';
      }
    } else {
      data = config.body;
    }
  }

  return { url, method, headers, data };
}

// ── Outbound target restrictions (SSRF) ───────────────────────────
// Webhook URLs are user-supplied and requested from our server, so they must not be able to
// reach loopback / private / link-local / cloud-metadata addresses. Local development can
// opt out with ALLOW_PRIVATE_WEBHOOK_TARGETS=true.

const allowPrivateTargets = () => process.env.ALLOW_PRIVATE_WEBHOOK_TARGETS === 'true';

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === '::' || v === '::1') return true;
  if (v.startsWith('::ffff:')) {
    const mapped = v.slice(7);
    return net.isIPv4(mapped) ? isPrivateIPv4(mapped) : true;
  }
  return v.startsWith('fc') || v.startsWith('fd') || /^fe[89ab]/.test(v);
}

function isBlockedIp(ip: string): boolean {
  if (net.isIPv4(ip)) return isPrivateIPv4(ip);
  if (net.isIPv6(ip)) return isPrivateIPv6(ip);
  return true;
}

function assertAllowedUrl(rawUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new WebhookConfigError('Webhook URL is not a valid URL.');
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new WebhookConfigError('Webhook URL must start with http:// or https://.');
  }
  // IP-literal hosts skip DNS lookup entirely, so check them up front.
  const host = parsed.hostname.replace(/^\[|\]$/g, '');
  if (!allowPrivateTargets() && net.isIP(host) && isBlockedIp(host)) {
    throw new BlockedTargetError('Webhooks can only target public addresses.');
  }
}

// Validates the address actually being connected to, which also defeats DNS rebinding
// (a hostname that resolves to a public IP at check time and a private one at connect time).
const guardedLookup: any = (hostname: string, options: any, callback: any) => {
  dns.lookup(hostname, options, (err: any, address: any, family: any) => {
    if (err) return callback(err, address, family);
    const resolved: { address: string }[] = Array.isArray(address) ? address : [{ address }];
    if (!allowPrivateTargets() && resolved.some(a => isBlockedIp(a.address))) {
      return callback(new BlockedTargetError(`${hostname} resolves to a private or reserved address`), address, family);
    }
    callback(null, address, family);
  });
};

const httpAgent = new http.Agent({ lookup: guardedLookup });
const httpsAgent = new https.Agent({ lookup: guardedLookup });

export interface WebhookResult {
  status: number;
  statusText: string;
  durationMs: number;
  data: any;
}

export async function executeWebhook(request: PreparedWebhookRequest): Promise<WebhookResult> {
  assertAllowedUrl(request.url);

  const startedAt = Date.now();
  const response = await axios.request({
    url: request.url,
    method: request.method as any,
    headers: request.headers,
    data: request.data,
    timeout: REQUEST_TIMEOUT_MS,
    maxRedirects: 0, // a redirect could otherwise point us at an address we'd have refused
    maxContentLength: MAX_RESPONSE_BYTES,
    maxBodyLength: MAX_RESPONSE_BYTES,
    validateStatus: () => true,
    proxy: false, // connect directly so the guarded lookup sees the real target
    httpAgent,
    httpsAgent,
  });

  return { status: response.status, statusText: response.statusText, durationMs: Date.now() - startedAt, data: response.data };
}

export function describeWebhookError(error: any): string {
  const message = String(error?.message || error);
  if (/private or reserved address/.test(message)) return `${message}. Webhooks can only target public addresses.`;
  if (error?.code === 'ECONNREFUSED') return 'Connection refused by the target server.';
  if (error?.code === 'ENOTFOUND') return 'Could not resolve the webhook host.';
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') return 'The request timed out.';
  return message;
}
