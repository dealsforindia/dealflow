export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get("token") || params.get("auth") || params.get("key") || params.get("admin_token");
    if (urlToken) {
      localStorage.setItem("dealflow_admin_token", urlToken);
      return urlToken;
    }
    const stored = localStorage.getItem("dealflow_admin_token");
    if (stored) return stored;
    return null;
  } catch {
    return null;
  }
}

export function getAdminHeaders(includeContentType: boolean = true): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    // Bearer only: the edge gateway no longer allows the custom X-Admin-Token
    // header through CORS, and the API accepts the standard header.
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
