"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { onIdTokenChanged, signOut, type User } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { TOKEN_COOKIE } from "@/lib/firebase/cookie";

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

function writeTokenCookie(token: string | null) {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = token
    ? `${TOKEN_COOKIE}=${token}; path=/; max-age=3600; SameSite=Lax${secure}`
    : `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax${secure}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires on sign-in, sign-out, and silent token refresh.
    return onIdTokenChanged(auth, async (next) => {
      writeTokenCookie(next ? await next.getIdToken() : null);
      setUser(next);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, logout: () => signOut(auth) }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
