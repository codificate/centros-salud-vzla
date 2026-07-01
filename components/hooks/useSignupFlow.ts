"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useSignUpFlow } from "@/components/providers/SignUpFlowProvider";
import { signInAction } from "@/app/actions/usuarios";
import { signInWithGoogle } from "@/lib/firebase/google";
import type { Centro } from "@/lib/api/types";

/**
 * Shared sign-up flow, identical from any entry point (centro drawer, navbar):
 *  - has Firebase session → signIn; on exists/not_found go to /onboarding
 *  - no session / unauthenticated → ask for Google, then retry and continue
 */
export function useSignupFlow() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCentro } = useSignUpFlow();

  const [askGoogle, setAskGoogle] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const goOnboarding = useCallback(
    (centro?: Centro | null) => {
      if (centro) setCentro(centro);
      router.push("/onboarding");
    },
    [router, setCentro]
  );

  const start = useCallback(
    async (centro?: Centro | null) => {
      if (centro) setCentro(centro);
      setError(null);
      if (!user) {
        setAskGoogle(true);
        return;
      }
      setBusy(true);
      const res = await signInAction();
      setBusy(false);
      if (res.status === "exists" || res.status === "not_found")
        goOnboarding(centro);
      else if (res.status === "unauthenticated") setAskGoogle(true);
      else setError(res.message);
    },
    [user, setCentro, goOnboarding]
  );

  const confirmGoogle = useCallback(
    async (centro?: Centro | null) => {
      setAskGoogle(false);
      setBusy(true);
      setError(null);
      try {
        await signInWithGoogle(); // account chooser + persist token
        await signInAction(); // refresh session now that token cookie is set
        goOnboarding(centro);
      } catch {
        setError("No se pudo iniciar con Google.");
      } finally {
        setBusy(false);
      }
    },
    [goOnboarding]
  );

  const cancelGoogle = useCallback(() => setAskGoogle(false), []);

  const reset = useCallback(() => {
    setAskGoogle(false);
    setError(null);
  }, []);

  return { askGoogle, busy, error, start, confirmGoogle, cancelGoogle, reset };
}
