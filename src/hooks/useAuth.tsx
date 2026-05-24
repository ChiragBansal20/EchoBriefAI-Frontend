/**
 * useAuth.tsx
 * Replaces Supabase auth with the JWT-based Express backend.
 * Provides the same interface as the original so all pages work unchanged.
 */

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { auth, getAccessToken, clearTokens } from "@/lib/api";

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  // kept for compatibility with pages that destructure `session`
  session: { user: User } | null;
}

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle Google OAuth callback (/auth/callback?access=...&refresh=...)
    if (window.location.pathname === "/auth/callback") {
      const handled = auth.handleGoogleCallback();
      if (handled) window.history.replaceState({}, "", "/profile");
    }

    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    auth.me()
      .then((data) => setUser(data.user))
      .catch(() => { clearTokens(); setUser(null); })
      .finally(() => setLoading(false));
  }, []);

  const signOut = async () => {
    await auth.logout();
    setUser(null);
    window.location.href = "/";
  };

  return (
    <Ctx.Provider value={{ user, session: user ? { user } : null, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
