// Minimal HTTP helper for inbox providers (Node 18+ global fetch).

export interface HttpOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

export class HttpError extends Error {
  constructor(public status: number, public body: unknown, message?: string) {
    super(message || `HTTP ${status}`);
  }
}

export async function httpJson<T = any>(url: string, opts: HttpOptions = {}): Promise<T> {
  const u = new URL(url);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) u.searchParams.set(k, String(v));
    }
  }

  const res = await fetch(u.toString(), {
    method: opts.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers || {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const text = await res.text();
  let parsed: unknown = undefined;
  try {
    parsed = text ? JSON.parse(text) : undefined;
  } catch {
    parsed = text;
  }

  if (!res.ok) {
    throw new HttpError(res.status, parsed, `Request to ${u.pathname} failed (${res.status})`);
  }
  return parsed as T;
}

/**
 * Live mode is OFF by default so dev/demo stays on deterministic mock data.
 * Set INBOX_LIVE=true (and provide real API keys) to hit real provider APIs.
 */
export function isLiveMode(): boolean {
  return process.env.INBOX_LIVE === 'true';
}
