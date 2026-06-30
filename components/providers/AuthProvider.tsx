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
import { setTokenCookie } from "@/lib/firebase/token";

interface AuthState {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires on sign-in, sign-out, and silent token refresh.
    return onIdTokenChanged(auth, async (next) => {
      setTokenCookie(next ? await next.getIdToken() : null);
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
