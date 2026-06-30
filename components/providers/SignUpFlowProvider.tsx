"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { Centro } from "@/lib/api/types";

interface SignUpFlow {
  centro: Centro | null;
  setCentro: (centro: Centro | null) => void;
}

const SignUpFlowContext = createContext<SignUpFlow | null>(null);

export function SignUpFlowProvider({ children }: { children: React.ReactNode }) {
  const [centro, setCentro] = useState<Centro | null>(null);
  const value = useMemo(() => ({ centro, setCentro }), [centro]);
  return (
    <SignUpFlowContext.Provider value={value}>
      {children}
    </SignUpFlowContext.Provider>
  );
}

export function useSignUpFlow(): SignUpFlow {
  const ctx = useContext(SignUpFlowContext);
  if (!ctx)
    throw new Error("useSignUpFlow must be used within <SignUpFlowProvider>");
  return ctx;
}
