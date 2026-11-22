import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export class UnsafeUrlError extends Error {}

const MAX_REDIRECTS = 5;
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB of HTML is plenty for a landing page

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === '::' || v === '::1') return true;
  if (v.startsWith('fc') || v.startsWith('fd')) return true; // unique local
  if (v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb')) return true; // link local
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) return isPrivateIPv6(ip);
  return true;
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError('That does not look like a valid web address.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeUrlError('Only http and https addresses can be checked.');
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError('Addresses with a login in them cannot be checked.');
  }
  if (url.port && url.port !== '80' && url.port !== '443') {
    throw new UnsafeUrlError('Only standard web ports can be checked.');
  }
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new UnsafeUrlError('That address points to a private network, so it cannot be checked.');
  }
  if (isIP(host)) {
    if (isPrivateIp(host)) throw new UnsafeUrlError('That address points to a private network, so it cannot be checked.');
    return url;
  }
  if (!host.includes('.')) {
    throw new UnsafeUrlError('Please enter a full domain, like example.com.');
  }
  let addrs: { address: string }[];
  try {
    addrs = await lookup(host, { all: true });
  } catch {
    throw new UnsafeUrlError('We could not find that domain.');
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) {
    throw new UnsafeUrlError('That address points to a private network, so it cannot be checked.');
  }
  return url;
}

async function readCapped(res: Response): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_BYTES) {
      await reader.cancel();
      break;
    }
    chunks.push(value);
  }
  return new TextDecoder().decode(Buffer.concat(chunks));
}

export interface SafeFetchResult {
  finalUrl: string;
  status: number;
  text: string;
}

/**
 * Fetch a public web page. Every hop (including redirects) is checked against
 * private ranges, the body is size-capped and only HTML/CSS/text is accepted.
 */
export async function safeFetchText(
  rawUrl: string,
  opts: { timeoutMs: number; accept: string; userAgent: string; allowTypes?: RegExp }
): Promise<SafeFetchResult> {
  let current = (await assertPublicUrl(rawUrl)).toString();
  const signal = AbortSignal.timeout(opts.timeoutMs);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await fetch(current, {
      headers: { 'User-Agent': opts.userAgent, Accept: opts.accept },
      redirect: 'manual',
      signal,
    });

    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      const next = new URL(res.headers.get('location') as string, current).toString();
      current = (await assertPublicUrl(next)).toString();
      continue;
    }

    const type = res.headers.get('content-type') || '';
    if (!(opts.allowTypes ?? /text\/html|application\/xhtml\+xml/i).test(type)) {
      throw new UnsafeUrlError('That address did not return a web page.');
    }
    const text = await readCapped(res);
    return { finalUrl: current, status: res.status, text };
  }
  throw new UnsafeUrlError('That address redirected too many times.');
}
