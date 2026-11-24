import http from 'node:http';
import https from 'node:https';
import dns from 'node:dns/promises';
import { isIP } from 'node:net';
import zlib from 'node:zlib';

export class UnsafeUrlError extends Error {}

const MAX_REDIRECTS = 5;
const MAX_WIRE_BYTES = 6 * 1024 * 1024;
const MAX_TEXT_BYTES = 3 * 1024 * 1024;

function isPrivateIPv4(ip: string): boolean {
  const [a, b] = ip.split('.').map(Number);
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

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase();
  if (v === '::' || v === '::1') return true;
  if (v.startsWith('fc') || v.startsWith('fd')) return true;
  if (/^fe[89ab]/.test(v)) return true;
  const mapped = v.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return isPrivateIPv4(mapped[1]);
  return false;
}

export function isPrivateIp(ip: string): boolean {
  const kind = isIP(ip);
  if (kind === 4) return isPrivateIPv4(ip);
  if (kind === 6) return isPrivateIPv6(ip);
  return true;
}

export interface CheckedTarget {
  url: URL;
  address: string;
  family: 4 | 6;
}

/** Validate a URL and resolve it to a public IP. The returned address is the only one we connect to. */
export async function resolvePublicTarget(raw: string): Promise<CheckedTarget> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UnsafeUrlError('That does not look like a valid web address.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new UnsafeUrlError('Only http and https addresses can be checked.');
  if (url.username || url.password) throw new UnsafeUrlError('Addresses with a login in them cannot be checked.');
  if (url.port && url.port !== '80' && url.port !== '443') throw new UnsafeUrlError('Only standard web ports can be checked.');

  const host = url.hostname.replace(/^\[|\]$/g, '');
  const privateMsg = 'That address points to a private network, so it cannot be checked.';
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) throw new UnsafeUrlError(privateMsg);

  const literal = isIP(host);
  if (literal) {
    if (isPrivateIp(host)) throw new UnsafeUrlError(privateMsg);
    return { url, address: host, family: literal as 4 | 6 };
  }
  if (!host.includes('.')) throw new UnsafeUrlError('Please enter a full domain, like example.com.');

  let addrs: { address: string; family: number }[];
  try {
    addrs = await dns.lookup(host, { all: true });
  } catch {
    throw new UnsafeUrlError('We could not find that domain.');
  }
  if (addrs.length === 0 || addrs.some((a) => isPrivateIp(a.address))) throw new UnsafeUrlError(privateMsg);
  return { url, address: addrs[0].address, family: addrs[0].family as 4 | 6 };
}

export async function assertPublicUrl(raw: string): Promise<URL> {
  return (await resolvePublicTarget(raw)).url;
}

export interface SafeFetchResult {
  finalUrl: string;
  status: number;
  text: string;
  contentType: string;
  contentEncoding: string;
  bytesOnWire: number;
  bytesDecoded: number;
  ttfbMs: number;
  totalMs: number;
  redirects: number;
}

interface Opts {
  timeoutMs: number;
  userAgent: string;
  accept?: string;
  allowTypes?: RegExp;
}

function requestOnce(target: CheckedTarget, opts: Opts, started: number) {
  return new Promise<{ status: number; headers: http.IncomingHttpHeaders; body: Buffer; ttfbMs: number }>((resolve, reject) => {
    const { url, address, family } = target;
    const lib = url.protocol === 'https:' ? https : http;
    const remaining = Math.max(500, opts.timeoutMs - (Date.now() - started));
    const req = lib.request(
      {
        protocol: url.protocol,
        hostname: url.hostname.replace(/^\[|\]$/g, ''),
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        headers: {
          'User-Agent': opts.userAgent,
          Accept: opts.accept || 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.5',
          'Accept-Encoding': 'gzip, br, deflate',
          'Accept-Language': 'en',
        },
        // Pin the connection to the address we already checked, so DNS cannot change between check and use.
        lookup: (_h, options, cb) => {
          const done = cb as unknown as (e: Error | null, a: string | { address: string; family: number }[], f?: number) => void;
          if (options && (options as { all?: boolean }).all) done(null, [{ address, family }]);
          else done(null, address, family);
        },
        servername: isIP(url.hostname) ? undefined : url.hostname,
      },
      (res) => {
        const ttfbMs = Date.now() - started;
        const chunks: Buffer[] = [];
        let total = 0;
        res.on('data', (c: Buffer) => {
          total += c.length;
          if (total > MAX_WIRE_BYTES) {
            req.destroy(new UnsafeUrlError('That page is too large to check.'));
            return;
          }
          chunks.push(c);
        });
        res.on('end', () => resolve({ status: res.statusCode || 0, headers: res.headers, body: Buffer.concat(chunks), ttfbMs }));
        res.on('error', reject);
      }
    );
    req.setTimeout(remaining, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
    req.end();
  });
}

function decode(body: Buffer, encoding: string): Buffer {
  const opts = { maxOutputLength: MAX_TEXT_BYTES };
  try {
    if (encoding.includes('br')) return zlib.brotliDecompressSync(body, opts);
    if (encoding.includes('gzip')) return zlib.gunzipSync(body, opts);
    if (encoding.includes('deflate')) return zlib.inflateSync(body, opts);
  } catch {
    throw new UnsafeUrlError('That page is too large or could not be read.');
  }
  if (body.length > MAX_TEXT_BYTES) throw new UnsafeUrlError('That page is too large to check.');
  return body;
}

/**
 * Fetch a public page. Each hop (including redirects) is validated and pinned to a checked public IP,
 * the body is size-capped and only HTML is accepted.
 */
export async function safeFetchPage(rawUrl: string, opts: Opts): Promise<SafeFetchResult> {
  const started = Date.now();
  let target = await resolvePublicTarget(rawUrl);

  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const res = await requestOnce(target, opts, started);
    const location = res.headers.location;
    if (res.status >= 300 && res.status < 400 && location) {
      target = await resolvePublicTarget(new URL(location, target.url).toString());
      continue;
    }
    const contentType = String(res.headers['content-type'] || '');
    if (!(opts.allowTypes ?? /text\/html|application\/xhtml\+xml/i).test(contentType)) {
      throw new UnsafeUrlError('That address did not return a web page.');
    }
    const encoding = String(res.headers['content-encoding'] || '').toLowerCase();
    const decoded = decode(res.body, encoding);
    return {
      finalUrl: target.url.toString(),
      status: res.status,
      text: decoded.toString('utf8'),
      contentType,
      contentEncoding: encoding,
      bytesOnWire: res.body.length,
      bytesDecoded: decoded.length,
      ttfbMs: res.ttfbMs,
      totalMs: Date.now() - started,
      redirects: hop,
    };
  }
  throw new UnsafeUrlError('That address redirected too many times.');
}
