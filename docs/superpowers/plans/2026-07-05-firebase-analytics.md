# Firebase Analytics Interaction Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instrument the Next.js App Router frontend with Firebase Analytics (GA4) — automatic page_view/session collection plus a typed catalog of manual events for the interactions that matter.

**Architecture:** A side-effect-free `analytics.ts` core lazily loads `firebase/analytics` via dynamic import (browser + `isSupported()` + `measurementId` only), exposing typed `track` / `setAnalyticsUser`. A typed `events.ts` catalog is the single source of truth for event names + params. A client `AnalyticsProvider` mounted in the root layout inits analytics, logs `page_view` on route change, and sets the Firebase UID. Existing client handlers call `track()`.

**Tech Stack:** Next.js 14 (App Router), React 18, TypeScript 5.6, `firebase@^12.15.0` (already installed), `node:test` runner.

## Global Constraints

- No new dependencies. `firebase/analytics` ships in installed `firebase@^12.15.0`.
- Reuse existing env var `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (already wired in `lib/firebase/config.ts`).
- No PII in analytics: user identity is Firebase UID only — never cédula/email/displayName.
- `track` / `setAnalyticsUser` must NEVER throw and must be safe no-ops on the server and when analytics is unavailable. Analytics failure must never break UX.
- No consent gate in this iteration.
- Event names use GA4 snake_case.
- Test runner: `npm test` → `node --test --conditions=react-server "lib/**/*.test.ts"`. Tests live under `lib/**` as `*.test.ts`.
- Follow existing patterns: `"use client"` at top of client files, `@/` path alias, existing `lib/firebase/*` module style.

---

### Task 1: Analytics core + typed event catalog

**Files:**
- Create: `lib/firebase/events.ts`
- Create: `lib/firebase/analytics.ts`
- Test: `lib/firebase/analytics.test.ts`

**Interfaces:**
- Consumes: `firebaseApp` from `lib/firebase/client.ts`, `firebaseConfig` from `lib/firebase/config.ts` (both via dynamic import).
- Produces:
  - `events.ts`: `interface AnalyticsEventMap` (event name → params), `type AnalyticsEventName = keyof AnalyticsEventMap`.
  - `analytics.ts`: `initAnalytics(): Promise<void>`, `track<E extends AnalyticsEventName>(name: E, params?: AnalyticsEventMap[E]): void`, `setAnalyticsUser(uid: string | null): void`, `useAnalytics(): { track: typeof track }`.

- [ ] **Step 1: Write the event catalog**

Create `lib/firebase/events.ts`:

```ts
// Single source of truth for Firebase Analytics (GA4) events.
// Event names use GA4 snake_case. login/logout/sign_up/search/page_view
// reuse GA4 recommended names for built-in reporting.
export interface AnalyticsEventMap {
  page_view: { page_path: string };
  login: { method: string };
  logout: Record<string, never>;
  sign_up: { method: string };
  signup_step: { step: number; step_name: string };
  signup_abandon: { step: number };
  centro_select: { centro_id: string; source: "list" | "map" | "autocomplete" };
  centro_view_insumos: { centro_id: string };
  insumo_filter: { filter_type: string; value: string };
  map_interaction: { action: "marker_click" | "zoom"; centro_id?: string };
  nav_click: { target: string };
  search: { search_term: string; context: string };
}

export type AnalyticsEventName = keyof AnalyticsEventMap;
```

- [ ] **Step 2: Write the failing test**

Create `lib/firebase/analytics.test.ts`:

```ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { track, setAnalyticsUser, initAnalytics } from "./analytics";

test("track is a no-op before init (server-safe, no throw)", () => {
  assert.doesNotThrow(() => track("login", { method: "google" }));
});

test("track accepts a param-less event without throwing", () => {
  assert.doesNotThrow(() => track("logout", {}));
});

test("setAnalyticsUser is a no-op before init", () => {
  assert.doesNotThrow(() => setAnalyticsUser("uid-123"));
  assert.doesNotThrow(() => setAnalyticsUser(null));
});

test("initAnalytics resolves to no-op on the server (no window)", async () => {
  await assert.doesNotReject(() => initAnalytics());
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module './analytics'` (file not yet created).

Note: if the runner errors on TypeScript syntax rather than the missing module, the local Node cannot strip types; re-run with `node --test --experimental-strip-types --conditions=react-server "lib/**/*.test.ts"` and use that form for the rest of the plan.

- [ ] **Step 4: Write the analytics core**

Create `lib/firebase/analytics.ts`:

```ts
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
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all 4 tests green (analytics stays uninitialized under node, every export is a no-op).

- [ ] **Step 6: Commit**

```bash
git add lib/firebase/events.ts lib/firebase/analytics.ts lib/firebase/analytics.test.ts
git commit -m "feat: firebase analytics core + typed event catalog"
```

---

### Task 2: AnalyticsProvider (page_view + user_id) in root layout

**Files:**
- Create: `components/providers/AnalyticsProvider.tsx`
- Modify: `app/layout.tsx`

**Interfaces:**
- Consumes: `initAnalytics`, `track`, `setAnalyticsUser` from `lib/firebase/analytics.ts`; `useAuth()` from `components/providers/AuthProvider.tsx` (returns `{ user: User | null, ... }`); `usePathname` from `next/navigation`.
- Produces: `AnalyticsProvider` React component (client).

- [ ] **Step 1: Write the provider**

Create `components/providers/AnalyticsProvider.tsx`:

```tsx
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

  // Log page_view after init resolves so SPA navigations are captured.
  useEffect(() => {
    void initAnalytics().then(() => {
      track("page_view", { page_path: pathname });
    });
  }, [pathname]);

  // Associate events with the authenticated user (UID only). null on logout.
  useEffect(() => {
    setAnalyticsUser(user?.uid ?? null);
  }, [user]);

  return <>{children}</>;
}
```

- [ ] **Step 2: Mount the provider in the root layout**

Modify `app/layout.tsx`. Add the import and wrap the tree inside `AuthProvider` (the provider needs auth context):

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { SignUpFlowProvider } from "@/components/providers/SignUpFlowProvider";
import { AnalyticsProvider } from "@/components/providers/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Centros de Salud - Venezuela",
  description: "Listado de centros de salud en Venezuela",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <AuthProvider>
          <AnalyticsProvider>
            <SignUpFlowProvider>{children}</SignUpFlowProvider>
          </AnalyticsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Verify build + types**

Run: `npm run build`
Expected: Build succeeds, no type errors. (`AnalyticsProvider` is a client component nested under the client `AuthProvider`.)

- [ ] **Step 4: Commit**

```bash
git add components/providers/AnalyticsProvider.tsx app/layout.tsx
git commit -m "feat: mount AnalyticsProvider — page_view + user_id"
```

---

### Task 3: Instrument authentication + signup funnel

Wire auth events into existing handlers. For each file: read it, locate the named handler, insert the exact `track(...)` call at the described point.

**Files:**
- Modify: `components/Navbar.tsx` (handlers `login`, `logout` — see `Navbar.tsx:19-29` and the logout `<button onClick={logout}>` at `Navbar.tsx:89-95`)
- Modify: `components/hooks/useSignupFlow.ts` (`start`, `confirmGoogle` — `useSignupFlow.ts:33-68`)
- Modify: `components/SignUpOnboardingScreen.tsx` (onboarding step advance + submit success)
- Modify: `components/ExitConfirmDialog.tsx` (abandon confirm)

**Interfaces:**
- Consumes: `track` from `lib/firebase/analytics.ts`.
- Produces: no new exports — emits `login`, `logout`, `sign_up`, `signup_step`, `signup_abandon`.

- [ ] **Step 1: Instrument login + logout in Navbar**

In `components/Navbar.tsx`, add the import:

```tsx
import { track } from "@/lib/firebase/analytics";
```

In the `login` handler, add the event immediately after the successful `signInWithGoogle()` call:

```tsx
  const login = async () => {
    setLoginBusy(true);
    try {
      await signInWithGoogle(); // popup + persists token cookie
      track("login", { method: "google" });
      router.push("/dashboard");
    } catch {
      // user closed the popup / sign-in failed — no-op
    } finally {
      setLoginBusy(false);
    }
  };
```

Wrap the logout button handler so it emits before signing out. Change the logout `<button>`'s `onClick={logout}` to:

```tsx
                onClick={() => {
                  track("logout", {});
                  logout();
                }}
```

- [ ] **Step 2: Instrument signup funnel start + success**

In `components/hooks/useSignupFlow.ts`, add the import:

```tsx
import { track } from "@/lib/firebase/analytics";
```

In `confirmGoogle`, after `signInWithGoogle()` succeeds and before `goOnboarding(centro)`, emit `sign_up`:

```tsx
        await signInWithGoogle(); // account chooser + persist token
        track("sign_up", { method: "google" });
        await signInAction(); // refresh session now that token cookie is set
        goOnboarding(centro);
```

In `start`, when an already-authenticated user proceeds to onboarding (the `exists`/`not_found` branch), also emit `sign_up` there so returning users are counted:

```tsx
      if (res.status === "exists" || res.status === "not_found") {
        track("sign_up", { method: "google" });
        goOnboarding(centro);
      } else if (res.status === "unauthenticated") setAskGoogle(true);
      else setError(res.message);
```

- [ ] **Step 3: Instrument onboarding step advance + submit success**

Read `components/SignUpOnboardingScreen.tsx`. Add the import `import { track } from "@/lib/firebase/analytics";`.

- At the handler that advances to the next onboarding step, emit (use the component's current step index/name variables):

```tsx
track("signup_step", { step: stepIndex, step_name: stepName });
```

- At the point where the final onboarding submission succeeds (after the server action resolves OK, before redirect), emit the completion step:

```tsx
track("signup_step", { step: stepIndex, step_name: "completed" });
```

If the file exposes the step as a string enum rather than an index, pass `step: 0` and the string as `step_name`. Do not invent new step names — reuse whatever labels the component already defines.

- [ ] **Step 4: Instrument signup abandon**

Read `components/ExitConfirmDialog.tsx`. Add the import `import { track } from "@/lib/firebase/analytics";`.

In the confirm/exit handler (the callback fired when the user confirms leaving — e.g. the `onConfirm` prop invocation), emit before the existing exit logic runs:

```tsx
track("signup_abandon", { step: 0 });
```

If the dialog receives the current step as a prop, pass that value instead of `0`. If it does not, leave `0` — do not add new props solely for analytics.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: Build succeeds, no type errors. Any bad event name or param shape fails the type check here.

- [ ] **Step 6: Commit**

```bash
git add components/Navbar.tsx components/hooks/useSignupFlow.ts components/SignUpOnboardingScreen.tsx components/ExitConfirmDialog.tsx
git commit -m "feat: track auth + signup funnel events"
```

---

### Task 4: Instrument discovery — centro, insumos, map, nav, search

Wire the domain-interaction events. For each file: read it, find the named handler, insert the exact `track(...)` call.

**Files:**
- Modify: `components/CentrosList.tsx` (centro click → `centro_select` source `"list"`)
- Modify: `components/CentroAutocomplete.tsx` (selection → `centro_select` source `"autocomplete"`; query submit → `search`)
- Modify: `components/CentrosMap.tsx` and/or `components/CentroMap.tsx` (marker click → `centro_select` source `"map"` + `map_interaction`)
- Modify: `components/CentroDrawer.tsx` (open insumos → `centro_view_insumos`)
- Modify: `components/TiposInsumosAutocomplete.tsx` and `components/InsumosPanel.tsx` (filter change → `insumo_filter`)
- Modify: `components/Navbar.tsx` (nav links → `nav_click`)

**Interfaces:**
- Consumes: `track` from `lib/firebase/analytics.ts`.
- Produces: no new exports — emits `centro_select`, `centro_view_insumos`, `insumo_filter`, `map_interaction`, `nav_click`, `search`.

- [ ] **Step 1: centro_select from the list**

Read `components/CentrosList.tsx`. Add `import { track } from "@/lib/firebase/analytics";`. In the handler that fires when a user picks a centro (the onClick / onSelect that receives the centro), emit before the existing navigation/selection:

```tsx
track("centro_select", { centro_id: String(centro.id), source: "list" });
```

Use the file's actual centro identifier field (`centro.id` / `centro.centroId` — match what the type defines). Wrap in `String(...)` to keep the param a string.

- [ ] **Step 2: centro_select + search from autocomplete**

Read `components/CentroAutocomplete.tsx`. Add the import. In the option-selected handler emit:

```tsx
track("centro_select", { centro_id: String(centro.id), source: "autocomplete" });
```

In the handler that runs a query/search (where the typed term triggers a lookup), emit:

```tsx
track("search", { search_term: query, context: "centro_autocomplete" });
```

Use the component's existing query-string variable for `query`.

- [ ] **Step 3: map_interaction + centro_select from the map**

Read `components/CentrosMap.tsx` and `components/CentroMap.tsx`. Add the import to whichever owns the marker click handler. On marker click emit both a selection and a map interaction:

```tsx
track("centro_select", { centro_id: String(centro.id), source: "map" });
track("map_interaction", { action: "marker_click", centro_id: String(centro.id) });
```

If a zoom handler is exposed (leaflet `zoomend`), emit `track("map_interaction", { action: "zoom" })` there. If no zoom handler exists, do not add one — skip zoom.

- [ ] **Step 4: centro_view_insumos**

Read `components/CentroDrawer.tsx`. Add the import. At the point the drawer opens a centro's insumos (the effect/handler that loads or reveals insumos for the selected centro), emit once per open:

```tsx
track("centro_view_insumos", { centro_id: String(centro.id) });
```

Guard against duplicate firing on re-render by placing it in the open handler or an effect keyed on the centro id, matching the component's existing open logic.

- [ ] **Step 5: insumo_filter**

Read `components/TiposInsumosAutocomplete.tsx` and `components/InsumosPanel.tsx`. Add the import to each that owns a filter control. In the filter change handler emit:

```tsx
track("insumo_filter", { filter_type: "tipo", value: String(selected) });
```

Set `filter_type` to describe the control (`"tipo"`, `"insumo"`, `"prioridad"` — whichever the control filters) and `value` to the chosen value. Only instrument controls that actually change the visible result set.

- [ ] **Step 6: nav_click**

In `components/Navbar.tsx` (import already added in Task 3), add `onClick` emitters to the two brand/nav `Link`s:

```tsx
<Link href="/" onClick={() => track("nav_click", { target: "home" })} ...>
```
```tsx
<Link href="/acerca" onClick={() => track("nav_click", { target: "acerca" })} ...>
```

And to the "Ir al Panel" dashboard link:

```tsx
<Link id="go-to-dashboard-button" href="/dashboard" onClick={() => track("nav_click", { target: "dashboard" })} ...>
```

Preserve every existing prop on these `Link`s — only add `onClick`.

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: Build succeeds, no type errors.

- [ ] **Step 8: Commit**

```bash
git add components/CentrosList.tsx components/CentroAutocomplete.tsx components/CentrosMap.tsx components/CentroMap.tsx components/CentroDrawer.tsx components/TiposInsumosAutocomplete.tsx components/InsumosPanel.tsx components/Navbar.tsx
git commit -m "feat: track centro, insumo, map, nav and search interactions"
```

---

### Task 5: Documentation + GA4 DebugView verification

**Files:**
- Modify: `README.md` (analytics section)
- Modify: `.env.example` (confirm measurement id documented — already present; add a one-line note)

**Interfaces:**
- Consumes: nothing.
- Produces: docs only.

- [ ] **Step 1: Document the analytics setup**

Add a short "Analytics" section to `README.md` describing: events are Firebase Analytics (GA4); the event catalog lives in `lib/firebase/events.ts`; new events are added there first, then emitted via `track(name, params)` from `lib/firebase/analytics.ts`; requires `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` to be set.

- [ ] **Step 2: Verify events reach GA4 (manual)**

Run: `npm run dev`, open the app, enable GA4 DebugView (`?firebase_analytics_debug_mode=true` or the GA Debug extension). Perform: navigate a route, log in, select a centro, change an insumo filter. Confirm `page_view`, `login`, `centro_select`, `insumo_filter` appear in DebugView.
Expected: All four events visible with correct params. If none appear, confirm `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` is set in `.env.local` and Enhanced Measurement is on in the Firebase console.

- [ ] **Step 3: Commit**

```bash
git add README.md .env.example
git commit -m "docs: document firebase analytics event catalog"
```

---

## Self-Review Notes

- **Spec coverage:** All 11 manual events + auto page_view/user_id covered (Tasks 2–4). SSR-safe core + typed catalog (Task 1). Testing (Task 1 unit + Task 5 DebugView). No PII (UID only, Task 2). No consent gate (omitted per spec).
- **Type consistency:** `AnalyticsEventMap` / `AnalyticsEventName` names identical across Tasks 1–4. `track` signature stable. `centro.id` stringified everywhere.
- **Known read-and-insert steps:** Tasks 3–4 instrument files not fully read during planning (`SignUpOnboardingScreen`, `ExitConfirmDialog`, `CentrosList`, `CentroAutocomplete`, `CentrosMap`, `CentroMap`, `CentroDrawer`, `TiposInsumosAutocomplete`, `InsumosPanel`). Each step gives the exact `track()` call + the named handler; the implementer reads the file and inserts. The type check in each task's build step catches wrong names/params.
```
