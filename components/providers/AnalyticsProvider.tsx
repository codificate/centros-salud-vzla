"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  initAnalytics,
  track,
  setAnalyticsUser,
} from "@/lib/firebase/analytics";

/**
 * Inits Firebase Analytics once, logs a page_view on each App Router route
 * change, and tags events with the Firebase UID. Renders children unchanged.
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  // Keyed on pathname only (not searchParams): this app navigates by distinct
  // paths, and reading searchParams here would force a Suspense boundary on the
  // whole tree in Next 14. Log after init resolves so SPA navigations are caught.
  useEffect(() => {
    let cancelled = false;
    void initAnalytics().then(() => {
      if (!cancelled) track("page_view", { page_path: pathname });
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  // Associate events with the authenticated user (UID only). null on logout.
  useEffect(() => {
    setAnalyticsUser(user?.uid ?? null);
  }, [user]);

  return <>{children}</>;
}
