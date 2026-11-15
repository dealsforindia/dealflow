/**
 * Canonical Image URL resolver for IndiaDealHunts.
 * Normalizes legacy backend IP addresses (http://74.225.250.0) to secure production HTTPS domain (https://api.rudranil.me).
 * Handles relative image paths and provides safe fallback image rendering.
 */
export function getCleanImageUrl(url?: string | null): string {
  if (!url) return '';
  let clean = url.trim();
  if (!clean) return '';

  // Upgrade legacy IP endpoints to official SSL production domain
  if (clean.includes('74.225.250.0')) {
    clean = clean.replace(/https?:\/\/74\.225\.250\.0(?::\d+)?/g, 'https://api.rudranil.me');
  }

  // Serve backend images through the public site's origin.
  clean = clean.replace(/^https?:\/\/api\.rudranil\.me\/images\//i, '/deal-images/');
  // Handle bare relative image paths like /images/abc.jpg or images/abc.jpg or upload_abc.jpg
  if (clean.startsWith('/images/')) {
    clean = clean.replace('/images/', '/deal-images/');
  } else if (clean.startsWith('images/')) {
    clean = `/deal-${clean}`;
  } else if (clean.startsWith('upload_')) {
    clean = `/deal-images/${clean}`;
  } else if (clean.startsWith('/upload_')) {
    clean = `/deal-images${clean}`;
  }

  // Force HTTPS if protocol is HTTP for our API domain
  if (clean.startsWith('http://api.rudranil.me')) {
    clean = clean.replace('http://', 'https://');
  }

  return clean;
}
