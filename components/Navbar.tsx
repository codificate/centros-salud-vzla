"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { signInWithGoogle } from "@/lib/firebase/google";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const signIn = async () => {
    setBusy(true);
    try {
      await signInWithGoogle();
    } catch {
      // user closed the popup / sign-in failed — no-op
    } finally {
      setBusy(false);
    }
  };

  return (
    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <span className="flex items-center gap-2 font-semibold text-slate-900">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-sky-600 text-xs font-bold text-white">
            CS
          </span>
          Centros de Salud
        </span>

        <div className="flex items-center gap-2">
          {loading ? null : user ? (
            <>
              <span className="hidden max-w-[10rem] truncate text-sm text-slate-600 sm:inline">
                {user.displayName ?? user.email}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
              >
                Salir
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={signIn}
                disabled={busy}
                className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:opacity-60"
              >
                Login
              </button>
              <button
                type="button"
                onClick={signIn}
                disabled={busy}
                className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500/40 disabled:opacity-60"
              >
                Regístrate
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
