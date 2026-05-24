const BASE = (import.meta.env.VITE_API_URL || "http://localhost:4000").replace(/\/$/, "");

// ── Image proxy — bypasses publisher CORS/referrer blocks ─────────────────────
export function proxyImage(url: string): string {
  if (!url || url.startsWith("data:") || url.startsWith("blob:")) return url;
  if (url.includes("unsplash.com") || url.includes("/api/news/image-proxy")) return url;
  return `${BASE}/api/news/image-proxy?url=${encodeURIComponent(url)}`;
}

// ── Token store ───────────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem("echobrief_access");
export const getRefreshToken = () => localStorage.getItem("echobrief_refresh");
export const setTokens = (a: string, r: string) => {
  localStorage.setItem("echobrief_access", a);
  localStorage.setItem("echobrief_refresh", r);
};
export const clearTokens = () => {
  localStorage.removeItem("echobrief_access");
  localStorage.removeItem("echobrief_refresh");
};

// ── Core fetch ────────────────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}): Promise<any> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(`${BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        const rr = await fetch(`${BASE}/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: refresh }),
        });
        if (rr.ok) {
          const d = await rr.json();
          setTokens(d.accessToken, d.refreshToken);
          headers["Authorization"] = `Bearer ${d.accessToken}`;
          res = await fetch(`${BASE}${path}`, { ...options, headers });
        } else { clearTokens(); }
      } catch { clearTokens(); }
    }
  }

  if (!res.ok && res.status !== 422) {
    let msg = `HTTP ${res.status}`;
    try { const b = await res.json(); msg = b.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const auth = {
  async register(email: string, password: string, full_name?: string) {
    const d = await apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify({ email, password, full_name }) });
    if (d.accessToken) setTokens(d.accessToken, d.refreshToken);
    return d;
  },
  async login(email: string, password: string) {
    const d = await apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (d.accessToken) setTokens(d.accessToken, d.refreshToken);
    return d;
  },
  async logout() {
    const r = getRefreshToken();
    await apiFetch("/api/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: r }) }).catch(() => {});
    clearTokens();
  },
  async me() { return apiFetch("/api/auth/me"); },
  googleLoginUrl: () => `${BASE}/api/auth/google`,
  handleGoogleCallback() {
    const p = new URLSearchParams(window.location.search);
    const a = p.get("access"), r = p.get("refresh");
    if (a && r) { setTokens(a, r); return true; }
    return false;
  },
  isLoggedIn: () => !!getAccessToken(),
};

// ── News ──────────────────────────────────────────────────────────────────────
export interface Article {
  title: string; description: string; url: string;
  source: string; publishedAt: string; image: string;
  readingTime?: number; topic?: string;
}
export const news = {
  async fetch(p: { topic?: string; lang?: string; max?: number; q?: string }) {
    const qs = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => v != null && qs.set(k, String(v)));
    return apiFetch(`/api/news?${qs}`);
  },
  async summarize(text: string, title?: string) {
    return apiFetch("/api/news/summarize", { method: "POST", body: JSON.stringify({ text, title }) });
  },
  async trending() { return apiFetch("/api/news/trending"); },
};

// ── Games ─────────────────────────────────────────────────────────────────────
export const games = {
  async recordScore(game: string, score?: number, duration_seconds?: number) {
    return apiFetch("/api/games/score", { method: "POST", body: JSON.stringify({ game, score, duration_seconds }) });
  },
  async leaderboard() { return apiFetch("/api/games/leaderboard"); },
  async streak()      { return apiFetch("/api/games/streak"); },
  async myScores(limit = 50) { return apiFetch(`/api/games/my-scores?limit=${limit}`); },
  async daily()       { return apiFetch("/api/games/daily"); },
};

// ── Profile ───────────────────────────────────────────────────────────────────
export const profile = {
  async get() { return apiFetch("/api/profile"); },
  async upsert(data: Record<string, any>) {
    return apiFetch("/api/profile", { method: "PUT", body: JSON.stringify(data) });
  },
  async getPublic(userId: string) { return apiFetch(`/api/profile/${userId}`); },
};

// ── Bookmarks ─────────────────────────────────────────────────────────────────
export const bookmarks = {
  async list() { return apiFetch("/api/bookmarks"); },
  async save(article: Record<string, any>) {
    return apiFetch("/api/bookmarks", { method: "POST", body: JSON.stringify(article) });
  },
  async remove(id: string) { return apiFetch(`/api/bookmarks/${id}`, { method: "DELETE" }); },
};
