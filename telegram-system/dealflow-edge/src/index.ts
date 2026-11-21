export interface Env {
  ORIGIN_API: string;
  STOREFRONT_URL?: string;
  ALLOWED_ORIGINS?: string;
}

export interface PublicDealSummary {
  id: string;
  display_ts?: number;
  posted_at?: number;
}

export interface PublicDealsPayload {
  deals?: PublicDealSummary[];
  total?: number;
  has_more?: boolean;
}

const DEFAULT_ALLOWED_ORIGINS = [
  'https://indiadealhunts.me',
  'https://www.indiadealhunts.me',
  'https://indiadealhunts.vercel.app',
  'https://dealflow-topaz-seven.vercel.app',
];

function getAllowedOrigins(env: Env): string[] {
  const configured = (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  return configured.length > 0 ? configured : DEFAULT_ALLOWED_ORIGINS;
}

function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('Origin') || '';
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "frame-ancestors 'self' https://web.telegram.org https://*.telegram.org https://t.me https://*.t.me;",
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  };
  if (origin && getAllowedOrigins(env).includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }
  return headers;
}

function cacheKeyFor(request: Request, url: URL): Request {
  // Keep per-origin responses separate so a cached CORS header for one
  // storefront is never served to a different origin. Cache keys always use GET.
  const keyUrl = new URL(url.toString());
  keyUrl.searchParams.set('__edge_origin', request.headers.get('Origin') || '');
  return new Request(keyUrl.toString(), {
    method: 'GET',
    headers: request.headers,
  });
}

const worker: ExportedHandler<Env> = {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. Handle CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(request, env),
      });
    }

    const url = new URL(request.url);
    const originBase = (env.ORIGIN_API || 'https://api.rudranil.me').replace(/\/+$/, '');
    // Direct edge hit for /feed-fallback/deals maps to origin /deals
    const normalizedPath = url.pathname === '/feed-fallback/deals' ? '/deals' : url.pathname;
    const originUrl = `${originBase}${normalizedPath}${url.search}`;

    // 2. Pass-through SSE / WebSocket endpoints without caching
    if (
      url.pathname.includes('/stream') ||
      url.pathname.includes('/ws') ||
      request.headers.get('Accept') === 'text/event-stream' ||
      request.headers.get('Upgrade')?.toLowerCase() === 'websocket'
    ) {
      const sseRequest = new Request(originUrl, request);
      return fetch(sseRequest);
    }

    // 2b. Dynamic Robots.txt for Search Engines
    if (url.pathname === '/robots.txt') {
      const storefrontUrl = (env.STOREFRONT_URL || 'https://indiadealhunts.vercel.app').replace(/\/+$/, '');
      const robots = [
        'User-agent: *',
        'Allow: /',
        'Disallow: /api/',
        '',
        `Sitemap: ${storefrontUrl}/sitemap.xml`,
        `Sitemap: https://dealflow-edge.pottemasshippo.workers.dev/sitemap.xml`,
      ].join('\n');
      return new Response(robots, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=86400',
          ...corsHeaders(request, env),
        },
      });
    }

    // 2c. Dynamic XML Sitemap for Google Search Indexing
    if (url.pathname === '/sitemap.xml') {
      const cache = caches.default;
      const cacheKey = cacheKeyFor(request, url);
      const cachedSitemap = await cache.match(cacheKey);
      if (cachedSitemap) {
        return cachedSitemap;
      }

      const storefrontUrl = (env.STOREFRONT_URL || 'https://indiadealhunts.vercel.app').replace(/\/+$/, '');
      const nowIso = new Date().toISOString();

      let deals: PublicDealSummary[] = [];
      try {
        const dealsRes = await fetch(`${originBase}/api/v1/deals/public?limit=500`, {
          method: 'GET',
          cf: { cacheTtl: 3600, cacheEverything: true },
        });
        if (dealsRes.ok) {
          const data = (await dealsRes.json()) as PublicDealsPayload | PublicDealSummary[];
          deals = Array.isArray(data) ? data : (data.deals || []);
        }
      } catch (err) {
        console.error('Sitemap deal fetch error:', err);
      }

      let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
      xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
      xml += `  <url>\n    <loc>${storefrontUrl}/</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>always</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${storefrontUrl}/?tab=ending_soon</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${storefrontUrl}/?tab=best_worth</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>hourly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
      xml += `  <url>\n    <loc>${storefrontUrl}/?tab=active_offers</loc>\n    <lastmod>${nowIso}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

      for (const d of deals) {
        if (!d || !d.id) continue;
        const dealUrl = `${storefrontUrl}/?deal=${encodeURIComponent(d.id)}`;
        const ts = d.display_ts || d.posted_at;
        const modDate = ts ? new Date(ts > 1e11 ? ts : ts * 1000).toISOString() : nowIso;
        xml += `  <url>\n    <loc>${dealUrl}</loc>\n    <lastmod>${modDate}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
      }
      xml += `</urlset>`;

      const sitemapResponse = new Response(xml, {
        headers: {
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
          ...corsHeaders(request, env),
        },
      });
      if (request.method === 'GET') {
        ctx.waitUntil(cache.put(cacheKey, sitemapResponse.clone()));
      }
      return sitemapResponse;
    }

    // 3. Dynamic OpenGraph / Social Share Shortlinks (/d/:id or /deal/:id)
    if (url.pathname.startsWith('/d/') || url.pathname.startsWith('/deal/')) {
      const cache = caches.default;
      const cacheKey = cacheKeyFor(request, url);
      let cachedOg = await cache.match(cacheKey);
      if (cachedOg) {
        return cachedOg;
      }

      // Fetch dynamic OpenGraph preview from Origin API
      const ogResponse = await fetch(originUrl, {
        method: 'GET',
        headers: request.headers,
        cf: {
          cacheTtl: 300,
          cacheEverything: true,
        },
      });

      if (ogResponse.ok) {
        const responseClone = new Response(ogResponse.body, ogResponse);
        responseClone.headers.set('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=60');
        responseClone.headers.set('Content-Type', 'text/html; charset=utf-8');
        for (const [k, v] of Object.entries(corsHeaders(request, env))) {
          responseClone.headers.set(k, v);
        }
        if (request.method === 'GET') {
          ctx.waitUntil(cache.put(cacheKey, responseClone.clone()));
        }
        return responseClone;
      }
      const errClone = new Response(ogResponse.body, ogResponse);
      for (const [k, v] of Object.entries(corsHeaders(request, env))) {
        errClone.headers.set(k, v);
      }
      return errClone;
    }

    // 4. Non-GET requests pass directly to origin
    if (request.method !== 'GET') {
      const mutationResponse = await fetch(new Request(originUrl, request));
      const mutableClone = new Response(mutationResponse.body, mutationResponse);
      for (const [k, v] of Object.entries(corsHeaders(request, env))) {
        mutableClone.headers.set(k, v);
      }
      return mutableClone;
    }

    // 5. Edge Caching for Public Deals, Videos Feed, Ticker, Wall of Happiness & External Search
    const isPublicFeed =
      url.pathname.includes('/deals/public') ||
      url.pathname.includes('/deals/videos') ||
      url.pathname.includes('/deals/ticker') ||
      url.pathname.includes('/deals/wall-of-happiness') ||
      url.pathname.includes('/deals/stories') ||
      url.pathname.includes('/search/external') ||
      url.pathname === '/deals' ||
      url.pathname === '/deals/' ||
      url.pathname === '/feed-fallback/deals';
    const cache = caches.default;
    const cacheKey = cacheKeyFor(request, url);
    let cachedResponse = await cache.match(cacheKey);

    if (cachedResponse && isPublicFeed) {
      const hitResponse = new Response(cachedResponse.body, cachedResponse);
      hitResponse.headers.set('X-Edge-Cache', 'HIT');
      for (const [k, v] of Object.entries(corsHeaders(request, env))) {
        hitResponse.headers.set(k, v);
      }
      return hitResponse;
    }

    // Fetch from Origin Azure VM with circuit breaker protection
    const originRequest = new Request(originUrl, {
      method: request.method,
      headers: request.headers,
      cf: isPublicFeed
        ? {
            cacheTtl: url.pathname.includes('/deals/ticker') ? 20 : 60,
            cacheEverything: true,
          }
        : undefined,
    });

    let response: Response;
    try {
      response = await fetch(originRequest);
    } catch (fetchErr) {
      console.error('Origin fetch error:', fetchErr);
      return new Response(JSON.stringify({ error: 'Origin service temporarily unavailable', status: 503 }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          ...corsHeaders(request, env),
        },
      });
    }

    if (response.ok && response.status === 200 && isPublicFeed) {
      const responseToCache = new Response(response.body, response);
      const maxAge = url.pathname.includes('/deals/ticker') ? 20 : 60;
      responseToCache.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${Math.floor(maxAge / 2)}`);
      responseToCache.headers.set('X-Edge-Cache', 'MISS');
      for (const [k, v] of Object.entries(corsHeaders(request, env))) {
        responseToCache.headers.set(k, v);
      }
      if (request.method === 'GET') {
        ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));
      }
      return responseToCache;
    }

    // Fallback response with CORS
    const finalResponse = new Response(response.body, response);
    for (const [k, v] of Object.entries(corsHeaders(request, env))) {
      finalResponse.headers.set(k, v);
    }
    return finalResponse;
  },
};

export default worker;
