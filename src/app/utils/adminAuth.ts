export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("dealflow_admin_token") || null;
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
