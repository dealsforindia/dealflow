export function merchantDestination(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase();
    if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || host === 'api.rudranil.me' || host.includes('desidime') || host.includes('ddime') || /^(?:localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(host) || host.includes(':')) return null;
    return url.href;
  } catch { return null; }
}
export async function resolveStoreRedirect(id, query = new URLSearchParams(), fetcher = fetch) {
  if (!/^[a-zA-Z0-9_-]{1,100}$/.test(id || '')) return { status: 404 };
  const endpoint = new URL(`https://api.rudranil.me/api/v1/deals/${id}/out`);
  for (const key of ['subid', 'ascsubtag']) { const value = query.get(key); if (value) endpoint.searchParams.set(key, value.slice(0, 150)); }
  try {
    const response = await fetcher(endpoint, { redirect: 'manual', signal: AbortSignal.timeout(12000) });
    const location = [301, 302, 303, 307, 308].includes(response.status) ? merchantDestination(response.headers.get('location')) : null;
    return location ? { status: 302, location } : { status: response.status === 404 ? 404 : 503 };
  } catch { return { status: 503 }; }
}
export const unavailableOfferPage = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offer unavailable · IndiaDealHunts</title><style>:root{color-scheme:light dark}body{margin:0;min-height:100vh;display:grid;place-items:center;font:16px/1.7 system-ui;background:#f7f8fa;color:#172b45}main{max-width:440px;padding:40px}small{letter-spacing:.12em;color:#637184}h1{line-height:1.2}a{display:inline-block;padding:12px 20px;border-radius:10px;background:#255de0;color:white;text-decoration:none}@media(prefers-color-scheme:dark){body{background:#0b1220;color:#e6edf7}small{color:#a0aec1}}</style><main><small>INDIADEALHUNTS</small><h1>This offer is unavailable.</h1><p>The merchant link could not be confirmed. Browse the latest offers or try again later.</p><a href="/">Find another deal</a></main></html>`;
