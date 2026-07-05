import type { Analytics } from "firebase/analytics";
import type { AnalyticsEventMap, AnalyticsEventName } from "./events";

// Loaded lazily so importing this module has zero firebase side effects
// (safe on the server and in the node:test runner).
type AnalyticsModule = typeof import("firebase/analytics");

let analytics: Analytics | null = null;
let mod: AnalyticsModule | null = null;
let initPromise: Promise<void> | null = null;

const isBrowser = typeof window !== "undefined";
const isDev = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev";

/** Init once per app load. No-op on server / unsupported / missing measurementId. */
export function initAnalytics(): Promise<void> {
  if (!isBrowser) return Promise.resolve();
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const { firebaseConfig } = await import("./config");
    if (!firebaseConfig.measurementId) return;
    const analyticsMod = await import("firebase/analytics");
    if (!(await analyticsMod.isSupported())) return;
    const { firebaseApp } = await import("./client");
    mod = analyticsMod;
    analytics = analyticsMod.getAnalytics(firebaseApp);
  })().catch((err) => {
    if (isDev) console.warn("[analytics] init failed", err);
  });
  return initPromise;
}

/** Log a typed GA4 event. Never throws. No-op until analytics is ready. */
export function track<E extends AnalyticsEventName>(
  name: E,
  params?: AnalyticsEventMap[E]
): void {
  try {
    if (!analytics || !mod) return;
    mod.logEvent(analytics, name as string, params);
  } catch (err) {
    if (isDev) console.warn("[analytics] track failed:", name, err);
  }
}

/** Associate events with the Firebase UID (no PII). null on logout. */
export function setAnalyticsUser(uid: string | null): void {
  try {
    if (!analytics || !mod) return;
    mod.setUserId(analytics, uid);
  } catch (err) {
    if (isDev) console.warn("[analytics] setUser failed", err);
  }
}

/** Thin hook for client components. `track` is already a stable reference. */
export function useAnalytics(): { track: typeof track } {
  return { track };
}
