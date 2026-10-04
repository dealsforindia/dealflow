export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  let token = localStorage.getItem("dealflow_admin_token");
  if (!token) {
    token = (import.meta as any).env?.VITE_ADMIN_TOKEN;
    if (token) {
      try {
        localStorage.setItem("dealflow_admin_token", token);
      } catch {}
    }
  }
  return token || "df_adm_549586c9722ab144751420b657b2f709bb10d1f251b9663b";
}

export function getAdminHeaders(includeContentType: boolean = true): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {};
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["X-Admin-Token"] = token;
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}
