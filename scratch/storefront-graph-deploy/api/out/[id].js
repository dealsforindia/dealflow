import { resolveStoreRedirect, unavailableOfferPage } from '../../server/storeRedirect.mjs';
export default async function handler(request, response) {
  const url = new URL(request.url, 'https://indiadealhunts.vercel.app');
  const result = await resolveStoreRedirect(String(request.query.id || ''), url.searchParams);
  response.setHeader('Cache-Control', 'no-store');
  if (result.location) { response.setHeader('Location', result.location); response.status(302).end(); return; }
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.status(result.status).send(unavailableOfferPage);
}
