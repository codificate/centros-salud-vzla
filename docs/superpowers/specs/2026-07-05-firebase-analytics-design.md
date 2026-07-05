# Firebase Analytics — Interaction Tracking Design

**Date:** 2026-07-05
**Status:** Approved (pending spec review)
**Requirement:** The frontend MUST track any meaningful interaction in the app.

## Goal

Instrument the Next.js App Router frontend with Firebase Analytics (GA4). Rely on
Firebase automatic collection for `page_view`, `session_start`, and engagement, and
add a small, typed catalog of manual events for the interactions that matter for
product decisions (auth funnel, centro discovery, insumo browsing, map use).

## Non-goals

- No global "log every click" listener (noise, PII risk, poor analyzability).
- No consent banner in this iteration (public health-data app, no personal data
  beyond Firebase UID). Can be layered on later without touching the event catalog.
- No custom analytics backend — GA4 via Firebase only.

## Decisions

| Decision | Choice |
|----------|--------|
| Tracking depth | Firebase auto-collection + curated manual events |
| API style | Central typed helper + `useAnalytics` hook |
| User identity | `setUserId(firebaseUid)` after login; no PII (no cédula/email) |
| Consent | No gate — analytics runs on load (implicit) |
| New deps | None. `firebase/analytics` ships in installed `firebase@^12.15.0` |
| Env | Reuse existing `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` |

## Architecture

### Units

1. **`lib/firebase/analytics.ts`** — SSR-safe analytics core.
   - Lazy-initializes `getAnalytics(firebaseApp)` only when: running in browser,
     `await isSupported()` is true, and `measurementId` is set.
   - Exports `track(name, params?)`, `setAnalyticsUser(uid | null)`.
   - All exports are safe no-ops on the server or when unsupported.
   - All calls wrapped in try/catch — analytics failure never breaks UX.
   - **Depends on:** `firebase/analytics`, `./client` (`firebaseApp`), `./config`.

2. **`lib/firebase/events.ts`** — typed event catalog (single source of truth).
   - A const object mapping event name → param shape (TypeScript types).
   - `track()` is generically typed against this catalog so unknown names or wrong
     params fail at compile time.
   - **Depends on:** nothing.

3. **`components/providers/AnalyticsProvider.tsx`** — client provider.
   - Mounted in `app/layout.tsx` inside `AuthProvider` (needs auth state).
   - Initializes analytics once on mount (`advanced-init-once` pattern).
   - Logs `page_view` on route change via `usePathname()` + `useSearchParams()`.
   - Calls `setAnalyticsUser(uid)` when auth user changes; `null` on logout.
   - **Depends on:** `analytics.ts`, `AuthProvider` context, `next/navigation`.

4. **`useAnalytics()` hook** (in `analytics.ts` or `components/hooks/`) — thin
   wrapper returning a stable `track` reference for client components.
   - **Depends on:** `analytics.ts`.

### Data flow

```
client component event handler
  → track("centro_select", { centro_id, source })
    → guard: browser? supported? analytics inited?
      → logEvent(analytics, name, params)   // GA4
```

Server components and server actions are untouched. Only client components import
the hook. `page_view` and `user_id` are handled centrally by the provider so
individual components only emit domain events.

## Event catalog

Automatic (Firebase, no code): `page_view` (SPA + provider-driven), `session_start`,
`first_visit`, `user_engagement`.

Manual events:

| Event | Trigger | Params |
|-------|---------|--------|
| `login` | Google sign-in success | `method: "google"` |
| `logout` | Sign out | — |
| `sign_up` | Onboarding submit success | `method: "google"` |
| `signup_step` | Onboarding step advance | `step: number`, `step_name: string` |
| `signup_abandon` | Exit confirm dialog accepted | `step: number` |
| `centro_select` | Centro chosen | `centro_id: string`, `source: "list" \| "map" \| "autocomplete"` |
| `centro_view_insumos` | Open a centro's insumos | `centro_id: string` |
| `insumo_filter` | Tipo/insumo filter changed | `filter_type: string`, `value: string` |
| `map_interaction` | Marker click / zoom | `action: "marker_click" \| "zoom"`, `centro_id?: string` |
| `nav_click` | Navbar link click | `target: string` |
| `search` | Autocomplete query submit | `search_term: string`, `context: string` |

Event names use GA4 snake_case. `login`/`logout`/`sign_up`/`search`/`page_view`
reuse GA4 recommended names for built-in reporting.

## Instrumentation points

Wire `track()` calls into existing handlers (49 `onClick`/`onSubmit`/`onChange`
surfaces across `components/` and `app/`):

- `lib/firebase/google.ts` / `AuthProvider` — `login`, `logout`.
- `SignUpOnboardingScreen.tsx` / `useSignupFlow.ts` — `sign_up`, `signup_step`.
- `ExitConfirmDialog.tsx` — `signup_abandon`.
- `CentrosList.tsx`, `CentrosMap.tsx`, `CentroAutocomplete.tsx` — `centro_select`.
- `CentroDrawer.tsx` / insumos pages — `centro_view_insumos`.
- `TiposInsumosAutocomplete.tsx`, `InsumosPanel.tsx` — `insumo_filter`.
- `CentroMap.tsx` — `map_interaction`.
- `Navbar.tsx` — `nav_click`.

## Error handling

- `track` / `setAnalyticsUser` swallow all errors (log to console only in dev).
- Missing `measurementId` → analytics disabled cleanly, `track` is a no-op.
- `isSupported()` false (SSR, some privacy browsers) → no-op.

## Testing

- Unit test `analytics.ts` guards: server-side `track` is a no-op (no throw);
  disabled when `measurementId` absent.
- Event catalog enforced at compile time via TypeScript (wrong name/params =
  type error). No runtime test needed for the catalog itself.
- Manual verification: dev build, confirm events appear in GA4 DebugView.

## Rollout

1. Analytics core + event catalog (unit tested).
2. Provider in layout (page_view + user_id).
3. Instrument handlers per catalog.
4. Verify in GA4 DebugView.
